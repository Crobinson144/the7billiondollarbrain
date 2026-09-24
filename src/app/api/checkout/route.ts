import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createProductCheckout } from "@/lib/stripe";
import { integrations } from "@/lib/env";

const body = z.object({
  lines: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(10) })).min(1).max(20),
  installments: z.number().int().default(1),
});

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in to check out." }, { status: 401 });
  if (!integrations.stripe()) return NextResponse.json({ error: "Online payments are not set up yet. Please contact us to order." }, { status: 503 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid cart." }, { status: 400 });
  try {
    const url = await createProductCheckout(user, parsed.data.lines, parsed.data.installments);
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Checkout failed." }, { status: 400 });
  }
}
