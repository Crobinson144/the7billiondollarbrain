import "server-only";
import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { authTokens } from "@/db/schema";
import { hashToken, newSessionToken } from "./tokens";

export type TokenPurpose = "VERIFY_EMAIL" | "RESET_PASSWORD";

const TTL_MINUTES: Record<TokenPurpose, number> = { VERIFY_EMAIL: 60 * 24 * 3, RESET_PASSWORD: 60 };

/** Creates a single-use link token and retires any earlier unused ones for the same purpose. */
export async function issueToken(userId: string, purpose: TokenPurpose): Promise<string> {
  const token = newSessionToken();
  const now = new Date();
  await db.update(authTokens).set({ usedAt: now })
    .where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose), isNull(authTokens.usedAt)));
  await db.insert(authTokens).values({
    userId, purpose, tokenHash: hashToken(token), expiresAt: new Date(now.getTime() + TTL_MINUTES[purpose] * 60_000),
  });
  return token;
}

/** Marks a token used and returns its user id, or null if it's unknown, expired or already used. Atomic. */
export async function consumeToken(token: string, purpose: TokenPurpose): Promise<string | null> {
  if (!token || token.length > 200) return null;
  const now = new Date();
  const [row] = await db.update(authTokens).set({ usedAt: now })
    .where(and(
      eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.purpose, purpose),
      isNull(authTokens.usedAt), gt(authTokens.expiresAt, now),
    ))
    .returning({ userId: authTokens.userId });
  return row?.userId ?? null;
}

/** Whether a token is currently usable, without using it (for showing an early error on the reset page). */
export async function tokenIsValid(token: string, purpose: TokenPurpose): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const [row] = await db.select({ id: authTokens.id }).from(authTokens)
    .where(and(
      eq(authTokens.tokenHash, hashToken(token)), eq(authTokens.purpose, purpose),
      isNull(authTokens.usedAt), gt(authTokens.expiresAt, new Date()),
    )).limit(1);
  return Boolean(row);
}
