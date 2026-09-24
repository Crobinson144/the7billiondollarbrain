import { drizzle } from "drizzle-orm/node-postgres";
import { and, eq, like } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { databaseUrl, pgConfig } from "../src/db/config";
import { CONTENT_DEFAULTS } from "../src/lib/content-defaults";
import { SEED_PRODUCTS } from "./seed-data";

/**
 * One-time copy updates for an existing database (September 2026). Each change only applies while the row still
 * holds the original text, so anything already edited in the admin panel is left alone. Safe to run repeatedly.
 */
async function main() {
  const pool = new Pool(pgConfig(databaseUrl()));
  const db = drizzle(pool, { schema });
  const changed: string[] = [];

  const about = await db.update(schema.contentBlocks).set({ body: CONTENT_DEFAULTS["about.body"].body })
    .where(and(eq(schema.contentBlocks.key, "about.body"), like(schema.contentBlocks.body, "%over 100 years%")))
    .returning({ key: schema.contentBlocks.key });
  if (about.length) changed.push("About us copy (33 years)");

  for (const slug of ["ultimate-business-success-package", "bare-bones-business-tradelines-package"]) {
    const next = SEED_PRODUCTS.find((p) => p.slug === slug)!;
    const rows = await db.update(schema.products)
      .set({ name: next.name, description: next.description, features: next.features })
      .where(and(eq(schema.products.slug, slug), eq(schema.products.published, false), like(schema.products.features, "%radeline%")))
      .returning({ slug: schema.products.slug });
    if (rows.length) changed.push(`${next.name} (draft) rewritten as a business credit setup program`);
  }

  await pool.end();
  console.log(changed.length ? `Updated:\n- ${changed.join("\n- ")}` : "Nothing to update.");
}
main().catch((e) => { console.error(e); process.exit(1); });
