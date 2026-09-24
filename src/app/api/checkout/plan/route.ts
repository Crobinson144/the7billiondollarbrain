import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createPlanCheckout, getPublishedPlan } from "@/lib/stripe";
import { integrations } from "@/lib/env";
import { checkoutBlocker } from "@/lib/checkout-guard";
import { recordConsent } from "@/lib/consent";
import { autoRenewalDisclosure } from "@/lib/legal";
import { formatCents } from "@/lib/money";

const body = z.object({ planId: z.string().min(1), agreeTerms: z.literal(true), agreeRenewal: z.boolean().optional() });

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to subscribe." }, { status: 401 });
  if (!integrations.stripe()) return NextResponse.json({ error: "Online payments are not set up yet. Please contact us to subscribe." }, { status: 503 });
  const blocked = checkoutBlocker(user);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const needsConsent = parsed.error.issues.some((i) => i.path[0] === "agreeTerms");
    return NextResponse.json({ error: needsConsent ? "Please agree to the Terms of Service and Refund Policy." : "Invalid plan." }, { status: 400 });
  }
  const plan = await getPublishedPlan(parsed.data.planId);
  if (!plan) return NextResponse.json({ error: "That plan is no longer available." }, { status: 404 });
  const price = formatCents(plan.monthlyPriceCents);
  // Open-ended plans renew automatically, so they need their own, separate agreement to the renewal terms.
  if (!plan.termMonths && parsed.data.agreeRenewal !== true)
    return NextResponse.json({ error: "Please agree to the automatic monthly renewal terms." }, { status: 400 });
  await recordConsent({ userId: user.id, email: user.email, kind: "CHECKOUT_TERMS", detail: `Plan checkout: ${plan.name}.` });
  if (!plan.termMonths)
    await recordConsent({ userId: user.id, email: user.email, kind: "AUTO_RENEWAL", detail: `${plan.name}: ${autoRenewalDisclosure(price)}` });
  try {
    return NextResponse.json({ url: await createPlanCheckout(user, plan) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 400 });
  }
}
