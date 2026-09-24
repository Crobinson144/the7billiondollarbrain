import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { databaseUrl, pgConfig } from "../src/db/config";
import * as schema from "../src/db/schema";
import { CONTENT_DEFAULTS } from "../src/lib/content-defaults";
import { SEED_PLANS, SEED_PRODUCTS, SEED_SERVICES } from "./seed-data";

/** Inserts the starting catalog and copy. Existing rows (matched by slug/key) are left untouched. */
async function main() {
  const pool = new Pool(pgConfig(databaseUrl()));
  const db = drizzle(pool, { schema });
  await db.insert(schema.services).values(SEED_SERVICES).onConflictDoNothing();
  await db.insert(schema.products).values(SEED_PRODUCTS).onConflictDoNothing();
  await db.insert(schema.plans).values(SEED_PLANS).onConflictDoNothing();
  await db.insert(schema.contentBlocks)
    .values(Object.entries(CONTENT_DEFAULTS).map(([key, v]) => ({ key, label: v.label, body: v.body })))
    .onConflictDoNothing();
  await pool.end();
  console.log("Seed complete.");
}
main().catch((e) => { console.error(e); process.exit(1); });
