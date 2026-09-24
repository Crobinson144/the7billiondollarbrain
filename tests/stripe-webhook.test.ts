/**
 * Integration test for Stripe webhook handling against a real Postgres database.
 * Runs only when TEST_DATABASE_URL points at a disposable, migrated database.
 */
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const url = process.env.TEST_DATABASE_URL;
const retrieve = vi.fn();
const update = vi.fn();
vi.mock("stripe", () => ({
  default: class { subscriptions = { retrieve, update }; },
}));

describe.skipIf(!url)("handleStripeEvent", () => {
  let mod: typeof import("@/lib/stripe");
  let db: typeof import("@/db").db;
  let s: typeof import("@/db/schema");
  let userId = "", planId = "", orderId = "";

  beforeAll(async () => {
    process.env.DATABASE_URL = url;
    process.env.STRIPE_SECRET_KEY = "sk_test_unit";
    ({ db } = await import("@/db"));
    s = await import("@/db/schema");
    mod = await import("@/lib/stripe");
    const tag = Date.now();
    [{ id: userId }] = await db.insert(s.users).values({ email: `wh${tag}@example.com`, name: "Webhook", passwordHash: "x" }).returning();
    [{ id: planId }] = await db.insert(s.plans).values({ slug: `plan-${tag}`, name: "Plan", monthlyPriceCents: 100000, termMonths: 3, grantsPremium: true }).returning();
    [{ id: orderId }] = await db.insert(s.orders).values({ userId, email: "x@example.com", totalCents: 30000 }).returning();
  });
  afterAll(async () => {
    const { pool } = await import("@/db");
    await pool.end();
  });

  const event = (id: string, type: string, object: unknown) => ({ id, type, data: { object } }) as never;

  it("marks a one-time order paid, once", async () => {
    const e = event(`evt_pay_${Date.now()}`, "checkout.session.completed",
      { mode: "payment", payment_status: "paid", metadata: { kind: "order", orderId }, subscription: null });
    await mod.handleStripeEvent(e);
    await mod.handleStripeEvent(e); // retry is a no-op
    const { eq } = await import("drizzle-orm");
    const [o] = await db.select().from(s.orders).where(eq(s.orders.id, orderId));
    expect(o.status).toBe("PAID");
  });

  it("stores a fixed-term plan subscription, schedules its end, and grants premium", async () => {
    const start = Math.floor(new Date("2026-10-05T15:00:00Z").getTime() / 1000);
    const sub = { id: `sub_${Date.now()}`, status: "active", start_date: start, current_period_end: start + 30 * 86400, cancel_at: null,
      metadata: { kind: "plan", planId, userId, payments: "3" } };
    retrieve.mockResolvedValueOnce(sub);
    update.mockImplementationOnce(async (_id: string, params: { cancel_at: number }) => ({ ...sub, cancel_at: params.cancel_at }));
    await mod.handleStripeEvent(event(`evt_sub_${Date.now()}`, "checkout.session.completed",
      { mode: "subscription", subscription: sub.id, metadata: { kind: "plan", planId, userId } }));
    expect(update).toHaveBeenCalledWith(sub.id, { cancel_at: Math.floor(new Date("2027-01-05T14:00:00Z").getTime() / 1000), proration_behavior: "none" });
    const { eq } = await import("drizzle-orm");
    const [row] = await db.select().from(s.subscriptions).where(eq(s.subscriptions.stripeSubscriptionId, sub.id));
    expect(row.status).toBe("active");
    expect(row.cancelAt?.toISOString()).toBe("2027-01-05T14:00:00.000Z");
    const { effectiveTier } = await import("@/lib/auth");
    expect(await effectiveTier({ id: userId, tierOverride: null })).toBe("PREMIUM");

    await mod.handleStripeEvent(event(`evt_del_${Date.now()}`, "customer.subscription.deleted", { ...sub, status: "canceled" }));
    expect(await effectiveTier({ id: userId, tierOverride: null })).toBe("BASIC");
  });
});
