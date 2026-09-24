import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { databaseUrl, pgConfig } from "../src/db/config";

async function main() {
  const pool = new Pool(pgConfig(databaseUrl()));
  await migrate(drizzle(pool), { migrationsFolder: "drizzle" });
  await pool.end();
  console.log("Migrations applied.");
}
main().catch((e) => { console.error(e); process.exit(1); });
