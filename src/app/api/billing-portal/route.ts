import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createBillingPortal } from "@/lib/stripe";
import { env, integrations } from "@/lib/env";

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.redirect(`${env.appUrl}/login?next=/account`, 303);
  if (!integrations.stripe()) return NextResponse.redirect(`${env.appUrl}/account?billing=unavailable`, 303);
  return NextResponse.redirect(await createBillingPortal(user), 303);
}
