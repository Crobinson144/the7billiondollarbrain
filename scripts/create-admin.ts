import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import { databaseUrl, pgConfig } from "../src/db/config";
import * as schema from "../src/db/schema";
import { hashPassword, PASSWORD_MIN_LENGTH } from "../src/lib/password";

/** Usage: npm run admin:create -- you@example.com "Your Name" "a-long-password" */
async function main() {
  const [email, name, password] = process.argv.slice(2);
  if (!email || !name || !password) throw new Error('Usage: npm run admin:create -- <email> "<name>" "<password>"');
  if (password.length < PASSWORD_MIN_LENGTH) throw new Error(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`);
  const pool = new Pool(pgConfig(databaseUrl()));
  const db = drizzle(pool, { schema });
  const normalized = email.trim().toLowerCase();
  const passwordHash = await hashPassword(password);
  const existing = await db.select().from(schema.users).where(eq(schema.users.email, normalized));
  if (existing.length) {
    await db.update(schema.users).set({ role: "ADMIN", passwordHash, name, emailVerifiedAt: new Date() }).where(eq(schema.users.email, normalized));
    console.log(`Updated ${normalized} to admin.`);
  } else {
    await db.insert(schema.users).values({ email: normalized, name, passwordHash, role: "ADMIN", emailVerifiedAt: new Date() });
    console.log(`Created admin ${normalized}.`);
  }
  await pool.end();
}
main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
