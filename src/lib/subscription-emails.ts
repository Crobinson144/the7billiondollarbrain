import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, users } from "@/db/schema";
import { sendEmail } from "./email";
import { env, publicEnv } from "./env";
import { autoRenewalDisclosure, fixedTermDisclosure } from "./legal";
import { formatCents } from "./money";

type Kind = "confirmation" | "cancelled" | "annual-reminder";

/**
 * Plan emails: the acknowledgment after subscribing, the cancellation confirmation, and the yearly reminder of the
 * renewal terms. Best effort: returns false (never throws) if email isn't set up or the lookup fails.
 */
export async function sendPlanEmail(kind: Kind, userId: string, planId: string, periodEnd?: Date | null): Promise<boolean> {
  try {
    const [row] = await db.select({ user: users, plan: plans }).from(users).innerJoin(plans, eq(plans.id, planId))
      .where(eq(users.id, userId)).limit(1);
    if (!row) return false;
    const { user, plan } = row;
    const price = formatCents(plan.monthlyPriceCents);
    const terms = plan.termMonths ? fixedTermDisclosure(price, plan.termMonths) : autoRenewalDisclosure(price);
    const manage = `${env.appUrl}/account (choose "Manage billing")`;
    const first = user.name.split(" ")[0];
    const sign = `The 7 Billion Dollar Brain · ${publicEnv.contactEmail}`;
    const bodies: Record<Kind, [string, string[]]> = {
      confirmation: [`You're subscribed: ${plan.name}`, [
        `Hi ${first},`, "", `Thanks for subscribing to ${plan.name}.`, "", `Billing terms: ${terms}`, "",
        `To cancel or update your card at any time, go to ${manage}.`,
        `Terms of Service: ${env.appUrl}/terms · Refund and Cancellation Policy: ${env.appUrl}/refunds`, "", sign,
      ]],
      cancelled: [`Cancellation confirmed: ${plan.name}`, [
        `Hi ${first},`, "", `Your ${plan.name} subscription has been cancelled and you won't be charged again.`,
        periodEnd ? `You keep access until ${periodEnd.toLocaleDateString("en-US", { dateStyle: "long" })}.` : "", "",
        `Changed your mind? You can subscribe again anytime at ${env.appUrl}/subscriptions.`, "", sign,
      ]],
      "annual-reminder": [`Reminder: your ${plan.name} renews every month`, [
        `Hi ${first},`, "", `This is your yearly reminder that ${plan.name} is an ongoing subscription.`, "",
        `Billing terms: ${terms}`, "", `To cancel online at any time, go to ${manage}.`, "", sign,
      ]],
    };
    const [subject, lines] = bodies[kind];
    return await sendEmail(user.email, subject, lines.join("\n"));
  } catch (e) {
    console.error("Plan email failed", kind, e);
    return false;
  }
}
