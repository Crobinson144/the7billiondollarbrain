import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createProductCheckout } from "@/lib/stripe";
import { integrations } from "@/lib/env";
import { checkoutBlocker } from "@/lib/checkout-guard";
import { recordConsent } from "@/lib/consent";

const body = z.object({
  lines: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
  installments: z.number().int().default(1),
  agreeTerms: z.literal(true),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
  if (!integrations.stripe()) return NextResponse.json({ error: "Online payments are not set up yet. Please contact us to order." }, { status: 503 });
  const blocked = checkoutBlocker(user);
  if (blocked) return NextResponse.json({ error: blocked }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    const needsConsent = parsed.error.issues.some((i) => i.path[0] === "agreeTerms");
    return NextResponse.json({ error: needsConsent ? "Please agree to the Terms of Service and Refund Policy." : "Invalid cart." }, { status: 400 });
  }
  const { lines, installments } = parsed.data;
  await recordConsent({
    userId: user.id, email: user.email, kind: "CHECKOUT_TERMS",
    detail: `Store checkout: ${lines.length} item(s), ${installments} payment(s).`,
  });
  try {
    const url = await createProductCheckout(user, lines, installments);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 400 });
  }
}
