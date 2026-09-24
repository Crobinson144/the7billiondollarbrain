import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createPlanCheckout, getPublishedPlan } from "@/lib/stripe";
import { integrations } from "@/lib/env";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to subscribe." }, { status: 401 });
  if (!integrations.stripe()) return NextResponse.json({ error: "Online payments are not set up yet. Please contact us to subscribe." }, { status: 503 });
  const parsed = z.object({ planId: z.string().min(1) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  const plan = await getPublishedPlan(parsed.data.planId);
  if (!plan) return NextResponse.json({ error: "That plan is no longer available." }, { status: 404 });
  try {
    return NextResponse.json({ url: await createPlanCheckout(user, plan) });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 400 });
  }
}
