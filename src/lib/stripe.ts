import "server-only";
import Stripe from "stripe";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, plans, processedEvents, products, subscriptions, users, type Plan } from "@/db/schema";
import { env } from "./env";
import { fixedTermCancelAt, isInstallmentCount, splitInstallments } from "./money";
import type { CurrentUser } from "./auth";

let client: Stripe | null = null;
export function getStripe(): Stripe {
  if (!env.stripeSecretKey) throw new Error("Payments are not configured yet (STRIPE_SECRET_KEY is missing).");
  client ??= new Stripe(env.stripeSecretKey, { timeout: 20_000, maxNetworkRetries: 1 });
  return client;
}

async function ensureCustomer(user: CurrentUser): Promise<string> {
  if (user.stripeCustomerId) return user.stripeCustomerId;
  const customer = await getStripe().customers.create({ email: user.email, name: user.name, metadata: { userId: user.id } });
  await db.update(users).set({ stripeCustomerId: customer.id }).where(eq(users.id, user.id));
  return customer.id;
}

export type CartLine = { productId: string; quantity: number };

/**
 * Checkout for store items. Prices always come from the database, never the browser.
 * installments > 1 is only allowed for a single package that permits it.
 */
export async function createProductCheckout(user: CurrentUser, lines: CartLine[], installments: number): Promise<string> {
  if (lines.length === 0) throw new Error("Your cart is empty.");
  if (!isInstallmentCount(installments)) throw new Error("Choose 1, 3, 6 or 9 payments.");
  const ids = [...new Set(lines.map((l) => l.productId))];
  const rows = await db.select().from(products).where(and(inArray(products.id, ids), eq(products.published, true)));
  if (rows.length !== ids.length) throw new Error("An item in your cart is no longer available.");
  const byId = new Map(rows.map((p) => [p.id, p]));
  const items = lines.map((l) => {
    const p = byId.get(l.productId)!;
    if (p.priceCents == null) throw new Error(`${p.name} is quote-only. Please request a quote.`);
    if (p.membersOnly && user.tier !== "PREMIUM" && user.role !== "ADMIN") throw new Error(`${p.name} is for premium members.`);
    const quantity = p.kind === "ADDON" ? Math.min(Math.max(1, Math.floor(l.quantity)), 10) : 1;
    return { product: p, quantity, priceCents: p.priceCents };
  });
  const totalCents = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  if (installments > 1 && !(items.length === 1 && items[0].product.allowInstallments))
    throw new Error("Installments are available when a single package is purchased on its own.");

  const customer = await ensureCustomer(user);
  const [order] = await db.insert(orders).values({ userId: user.id, email: user.email, totalCents, installments }).returning();
  await db.insert(orderItems).values(items.map((i) => ({
    orderId: order.id, productId: i.product.id, name: i.product.name, priceCents: i.priceCents, quantity: i.quantity,
  })));

  const common = {
    customer,
    client_reference_id: order.id,
    metadata: { orderId: order.id, userId: user.id, kind: "order", installments: String(installments) },
    success_url: `${env.appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/checkout/cancel`,
  } satisfies Partial<Stripe.Checkout.SessionCreateParams>;

  let session: Stripe.Checkout.Session;
  try {
    if (installments === 1) {
      session = await getStripe().checkout.sessions.create({
        ...common,
        mode: "payment",
        line_items: items.map((i) => ({
          quantity: i.quantity,
          price_data: { currency: "usd", unit_amount: i.priceCents, product_data: { name: i.product.name } },
        })),
      });
    } else {
      const { monthlyCents, firstPaymentExtraCents } = splitInstallments(totalCents, installments);
      const name = items[0].product.name;
      const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [{
        quantity: 1,
        price_data: {
          currency: "usd", unit_amount: monthlyCents, recurring: { interval: "month" },
          product_data: { name: `${name} (${installments} monthly payments)` },
        },
      }];
      if (firstPaymentExtraCents > 0) {
        lineItems.push({ quantity: 1, price_data: { currency: "usd", unit_amount: firstPaymentExtraCents, product_data: { name: "Rounding adjustment" } } });
      }
      session = await getStripe().checkout.sessions.create({
        ...common,
        mode: "subscription",
        line_items: lineItems,
        subscription_data: { metadata: { orderId: order.id, userId: user.id, kind: "installments", payments: String(installments) } },
      });
    }
  } catch (e) {
    await db.update(orders).set({ status: "FAILED" }).where(eq(orders.id, order.id));
    throw e;
  }
  await db.update(orders).set({ stripeSessionId: session.id }).where(eq(orders.id, order.id));
  if (!session.url) throw new Error("Stripe did not return a checkout link.");
  return session.url;
}

export async function createPlanCheckout(user: CurrentUser, plan: Plan): Promise<string> {
  const customer = await ensureCustomer(user);
  const session = await getStripe().checkout.sessions.create({
    customer,
    mode: "subscription",
    client_reference_id: user.id,
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "usd", unit_amount: plan.monthlyPriceCents, recurring: { interval: "month" },
        product_data: { name: plan.name },
      },
    }],
    metadata: { kind: "plan", planId: plan.id, userId: user.id },
    subscription_data: {
      metadata: { kind: "plan", planId: plan.id, userId: user.id, payments: plan.termMonths ? String(plan.termMonths) : "" },
    },
    success_url: `${env.appUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/checkout/cancel`,
  });
  if (!session.url) throw new Error("Stripe did not return a checkout link.");
  return session.url;
}

export async function createBillingPortal(user: CurrentUser): Promise<string> {
  const customer = await ensureCustomer(user);
  const portal = await getStripe().billingPortal.sessions.create({ customer, return_url: `${env.appUrl}/account` });
  return portal.url;
}

const toDate = (unix: number | null | undefined) => (unix ? new Date(unix * 1000) : null);

/** Stop a fixed-term subscription after its last payment. */
async function applyFixedTerm(sub: Stripe.Subscription, payments: number): Promise<Stripe.Subscription> {
  if (!payments || sub.cancel_at) return sub;
  const cancelAt = fixedTermCancelAt(new Date(sub.start_date * 1000), payments);
  return getStripe().subscriptions.update(sub.id, {
    cancel_at: Math.floor(cancelAt.getTime() / 1000), proration_behavior: "none",
  });
}

async function syncPlanSubscription(sub: Stripe.Subscription) {
  const { userId, planId } = sub.metadata;
  if (!userId || !planId) return;
  const values = {
    status: sub.status,
    currentPeriodEnd: toDate(sub.current_period_end),
    cancelAt: toDate(sub.cancel_at),
  };
  await db.insert(subscriptions)
    .values({ userId, planId, stripeSubscriptionId: sub.id, ...values })
    .onConflictDoUpdate({ target: subscriptions.stripeSubscriptionId, set: values });
}

/** Processes one verified Stripe event. Safe to call more than once for the same event. */
export async function handleStripeEvent(event: Stripe.Event): Promise<void> {
  const inserted = await db.insert(processedEvents).values({ id: event.id, type: event.type })
    .onConflictDoNothing().returning({ id: processedEvents.id });
  if (inserted.length === 0) return;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const kind = s.metadata?.kind;
        if (kind === "order" && s.metadata?.orderId) {
          const paid = s.payment_status === "paid" || s.mode === "subscription";
          await db.update(orders).set({
            status: paid ? "PAID" : "PENDING",
            stripeSubscriptionId: typeof s.subscription === "string" ? s.subscription : s.subscription?.id ?? null,
          }).where(eq(orders.id, s.metadata.orderId));
        }
        if (s.mode === "subscription" && s.subscription) {
          const subId = typeof s.subscription === "string" ? s.subscription : s.subscription.id;
          let sub: Stripe.Subscription = await getStripe().subscriptions.retrieve(subId);
          const payments = Number(sub.metadata.payments || 0);
          sub = await applyFixedTerm(sub, payments);
          if (sub.metadata.kind === "plan") await syncPlanSubscription(sub);
        }
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.orderId) await db.update(orders).set({ status: "PAID" }).where(eq(orders.id, s.metadata.orderId));
        break;
      }
      case "checkout.session.async_payment_failed":
      case "checkout.session.expired": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.metadata?.orderId)
          await db.update(orders).set({ status: "FAILED" })
            .where(and(eq(orders.id, s.metadata.orderId), eq(orders.status, "PENDING")));
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.metadata.kind === "plan") await syncPlanSubscription(sub);
        break;
      }
      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const pi = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
        if (pi && charge.refunded) {
          const sessions = await getStripe().checkout.sessions.list({ payment_intent: pi, limit: 1 });
          const orderId = sessions.data[0]?.metadata?.orderId;
          if (orderId) await db.update(orders).set({ status: "REFUNDED" }).where(eq(orders.id, orderId));
        }
        break;
      }
      default:
        break;
    }
  } catch (err) {
    // Let Stripe retry: forget the event so the retry is processed.
    await db.delete(processedEvents).where(eq(processedEvents.id, event.id));
    throw err;
  }
}

export async function getPublishedPlan(planId: string) {
  const [plan] = await db.select().from(plans).where(and(eq(plans.id, planId), eq(plans.published, true))).limit(1);
  return plan ?? null;
}
