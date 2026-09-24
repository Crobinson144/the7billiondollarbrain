/** Integration test for single-use email-link tokens. Runs only when TEST_DATABASE_URL is set. */
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const url = process.env.TEST_DATABASE_URL;

describe.skipIf(!url)("auth tokens", () => {
  let tokens: typeof import("@/lib/auth-tokens");
  let db: typeof import("@/db").db;
  let s: typeof import("@/db/schema");
  let userId = "";

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    ({ db } = await import("@/db"));
    s = await import("@/db/schema");
    tokens = await import("@/lib/auth-tokens");
    [{ id: userId }] = await db.insert(s.users).values({ email: `tok${Date.now()}@example.com`, name: "Token", passwordHash: "x" }).returning();
  });
  afterAll(async () => { (await import("@/db")).pool.end(); });

  it("works once, for its own purpose only", async () => {
    const t = await tokens.issueToken(userId, "RESET_PASSWORD");
    expect(await tokens.tokenIsValid(t, "RESET_PASSWORD")).toBe(true);
    expect(await tokens.consumeToken(t, "VERIFY_EMAIL")).toBeNull();
    expect(await tokens.consumeToken(t, "RESET_PASSWORD")).toBe(userId);
    expect(await tokens.consumeToken(t, "RESET_PASSWORD")).toBeNull();
    expect(await tokens.tokenIsValid(t, "RESET_PASSWORD")).toBe(false);
  });

  it("retires older links when a new one is issued", async () => {
    const first = await tokens.issueToken(userId, "VERIFY_EMAIL");
    const second = await tokens.issueToken(userId, "VERIFY_EMAIL");
    expect(await tokens.consumeToken(first, "VERIFY_EMAIL")).toBeNull();
    expect(await tokens.consumeToken(second, "VERIFY_EMAIL")).toBe(userId);
  });

  it("rejects expired and junk tokens", async () => {
    const { eq } = await import("drizzle-orm");
    const { hashToken } = await import("@/lib/tokens");
    const t = await tokens.issueToken(userId, "RESET_PASSWORD");
    await db.update(s.authTokens).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(s.authTokens.tokenHash, hashToken(t)));
    expect(await tokens.consumeToken(t, "RESET_PASSWORD")).toBeNull();
    expect(await tokens.consumeToken("", "RESET_PASSWORD")).toBeNull();
    expect(await tokens.consumeToken("x".repeat(500), "RESET_PASSWORD")).toBeNull();
  });
});
