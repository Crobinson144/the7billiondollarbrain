import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/db";
import { plans, sessions, subscriptions, users, type User } from "@/db/schema";
import { hashToken, newSessionToken } from "./tokens";
import { env } from "./env";

export const SESSION_COOKIE = "bdb_session";
const SESSION_DAYS = 30;

export type Tier = "BASIC" | "PREMIUM";
export type CurrentUser = Omit<User, "passwordHash"> & { tier: Tier };

export async function createSession(userId: string): Promise<void> {
  const token = newSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ tokenHash: hashToken(token), userId, expiresAt });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/", expires: expiresAt,
  });
}

export async function destroySession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

/** Premium comes from an admin override or an active subscription to a plan that grants it. */
export async function effectiveTier(user: Pick<User, "id" | "tierOverride">): Promise<Tier> {
  if (user.tierOverride) return user.tierOverride;
  const rows = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(and(
      eq(subscriptions.userId, user.id),
      inArray(subscriptions.status, ["active", "trialing"]),
      eq(plans.grantsPremium, true),
    ))
    .limit(1);
  return rows.length > 0 ? "PREMIUM" : "BASIC";
}

/** The signed-in user for this request, or null. Cached per request. */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: users })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row) return null;
  const { passwordHash: _omit, ...user } = row.user;
  return { ...user, tier: await effectiveTier(row.user) };
});

export async function requireUser(nextPath = "/account"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export async function requireAdmin(): Promise<CurrentUser> {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/account");
  return user;
}

/** Best-effort client IP for rate limiting. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

/** Only allow same-site relative redirects after login. */
export function safeNextPath(next: unknown, fallback = "/account"): string {
  return typeof next === "string" && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}
