import { drizzle } from "drizzle-orm/node-postgres";
import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { databaseUrl, pgConfig } from "./config";
import * as schema from "./schema";

const globalForDb = globalThis as unknown as { pool?: Pool };
const onVercel = Boolean(process.env.VERCEL);

function createPool(): Pool {
  const pool = new Pool({
    ...pgConfig(databaseUrl()),
    // Each serverless instance keeps a small pool; the provider's pooler (Supabase port 6543) multiplexes them.
    max: Number(process.env.DB_POOL_MAX) || (onVercel ? 5 : 10),
    idleTimeoutMillis: 5_000,
    connectionTimeoutMillis: 10_000,
  });
  // Poolers close idle connections; without a listener that error would crash the process.
  pool.on("error", (err) => console.error("Idle Postgres client error:", err.message));
  // Releases idle clients before a Vercel Fluid compute instance suspends, so connections aren't leaked.
  if (onVercel) attachDatabasePool(pool);
  return pool;
}

// Reuse one pool across hot reloads in development and across requests in production.
export const pool = globalForDb.pool ?? createPool();
if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
