import { readFileSync } from "node:fs";
import { Pool } from "pg";
import { databaseUrl, pgConfig } from "../src/db/config";

/**
 * Usage: npm run db:check
 * Confirms DATABASE_URL works the way the deployed site will use it: connection and TLS, parameterized
 * queries and a transaction (what a transaction pooler must support), migrations applied, row-level
 * security on every table, and seed data present.
 */
const results: { ok: boolean; label: string; detail: string }[] = [];
const record = (ok: boolean, label: string, detail = "") => results.push({ ok, label, detail });

function describeTarget(url: string): string {
  try {
    const u = new URL(url);
    const port = u.port || "5432";
    let mode = "";
    if (u.hostname.endsWith(".pooler.supabase.com")) {
      mode = port === "6543" ? " (Supabase transaction pooler: use this one on Vercel)" : " (Supabase session pooler: use this one for migrations)";
    } else if (/^db\..+\.supabase\.co$/.test(u.hostname)) {
      mode = " (Supabase direct connection: IPv6 only, won't work from Vercel; use the pooler string instead)";
    }
    return `${u.hostname}:${port}${u.pathname}${mode}`;
  } catch {
    return "(could not parse the URL; if the password has special characters, URL-encode them)";
  }
}

async function main() {
  const url = databaseUrl();
  console.log(`Target: ${describeTarget(url)}`);
  const cfg = pgConfig(url);
  const tls = cfg.ssl === false ? "off (local)" : typeof cfg.ssl === "object" && cfg.ssl.rejectUnauthorized ? "on, certificate verified" : "on, encrypted (set DATABASE_CA_CERT to also verify the certificate)";
  console.log(`TLS: ${tls}\n`);

  const pool = new Pool({ ...cfg, max: 2, connectionTimeoutMillis: 10_000 });
  try {
    const v = await pool.query<{ v: string }>("select current_setting('server_version') as v");
    record(true, "Connect", `Postgres ${v.rows[0].v}`);

    const a = await pool.query<{ n: number }>("select $1::int + 1 as n", [41]);
    const b = await pool.query<{ n: number }>("select $1::int + 1 as n", [1]);
    record(a.rows[0].n === 42 && b.rows[0].n === 2, "Parameterized queries", "repeated statements work through the pooler");

    const client = await pool.connect();
    try {
      await client.query("begin");
      await client.query("create temp table db_check_tmp (x int) on commit drop");
      await client.query("insert into db_check_tmp values ($1)", [1]);
      await client.query("commit");
      record(true, "Transaction", "begin/commit on one connection");
    } catch (e) {
      await client.query("rollback").catch(() => {});
      record(false, "Transaction", (e as Error).message);
    } finally {
      client.release();
    }

    const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: unknown[] };
    const applied = await pool
      .query<{ n: string }>("select count(*)::text as n from drizzle.__drizzle_migrations")
      .then((r) => Number(r.rows[0].n))
      .catch(() => 0);
    record(applied === journal.entries.length, "Migrations", `${applied} of ${journal.entries.length} applied${applied < journal.entries.length ? " - run npm run db:migrate" : ""}`);

    const tables = await pool.query<{ t: string; rls: boolean }>(
      "select c.relname as t, c.relrowsecurity as rls from pg_class c join pg_namespace n on n.oid = c.relnamespace where n.nspname = 'public' and c.relkind = 'r' order by 1",
    );
    const noRls = tables.rows.filter((r) => !r.rls).map((r) => r.t);
    record(
      tables.rows.length > 0 && noRls.length === 0,
      "Row-level security",
      tables.rows.length === 0 ? "no tables yet - run npm run db:migrate" : noRls.length === 0 ? `on for all ${tables.rows.length} tables` : `off for: ${noRls.join(", ")}`,
    );

    const seeded = await pool
      .query<{ n: string }>("select count(*)::text as n from services")
      .then((r) => Number(r.rows[0].n))
      .catch(() => 0);
    record(seeded > 0, "Seed data", seeded > 0 ? `${seeded} services` : "none - run npm run db:seed");

    const admins = await pool
      .query<{ n: string }>("select count(*)::text as n from users where role = 'ADMIN'")
      .then((r) => Number(r.rows[0].n))
      .catch(() => 0);
    record(admins > 0, "Admin account", admins > 0 ? `${admins} admin(s)` : "none - run npm run admin:create");
  } catch (e) {
    record(false, "Connect", (e as Error).message);
  } finally {
    await pool.end().catch(() => {});
  }

  for (const r of results) console.log(`${r.ok ? "PASS" : "FAIL"}  ${r.label.padEnd(22)} ${r.detail}`);
  if (results.some((r) => !r.ok)) process.exit(1);
}

main().catch((e) => {
  console.error(e.message ?? e);
  process.exit(1);
});
