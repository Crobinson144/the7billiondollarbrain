import { NextResponse } from "next/server";
import { and, eq, inArray, isNull, lt, or } from "drizzle-orm";
import { db } from "@/db";
import { authTokens, bookings, contactMessages, plans, sessions, subscriptions } from "@/db/schema";
import { env } from "@/lib/env";
import { sendPlanEmail } from "@/lib/subscription-emails";
import { dueForAnnualReminder } from "@/lib/reminders";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

/**
 * Daily job (vercel.json). Vercel calls it with "Authorization: Bearer $CRON_SECRET".
 * 1. Emails the yearly renewal-terms reminder for auto-renewing plans.
 * 2. Deletes data past the retention periods in the Privacy Policy.
 */
export async function GET(req: Request) {
  if (!env.cronSecret || req.headers.get("authorization") !== `Bearer ${env.cronSecret}`)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const now = new Date();

  const due = await db.select({ sub: subscriptions }).from(subscriptions)
    .innerJoin(plans, eq(plans.id, subscriptions.planId))
    .where(and(
      inArray(subscriptions.status, ["active", "trialing"]), isNull(plans.termMonths), isNull(subscriptions.cancelAt),
      or(isNull(subscriptions.renewalReminderSentAt), lt(subscriptions.renewalReminderSentAt, new Date(now.getTime() - 300 * DAY))),
    ));
  let reminders = 0;
  for (const { sub } of due) {
    if (!dueForAnnualReminder(sub.createdAt, sub.renewalReminderSentAt, now)) continue;
    if (await sendPlanEmail("annual-reminder", sub.userId, sub.planId)) {
      await db.update(subscriptions).set({ renewalReminderSentAt: now }).where(eq(subscriptions.id, sub.id));
      reminders++;
    }
  }

  const threeYearsAgo = new Date(now.getTime() - 3 * 365 * DAY);
  const [expiredSessions, oldTokens, oldMessages, oldBookings] = await Promise.all([
    db.delete(sessions).where(lt(sessions.expiresAt, now)).returning({ id: sessions.id }),
    db.delete(authTokens).where(lt(authTokens.expiresAt, new Date(now.getTime() - 30 * DAY))).returning({ id: authTokens.id }),
    db.delete(contactMessages).where(lt(contactMessages.createdAt, threeYearsAgo)).returning({ id: contactMessages.id }),
    db.delete(bookings).where(lt(bookings.startsAt, threeYearsAgo)).returning({ id: bookings.id }),
  ]);

  return NextResponse.json({
    reminders,
    purged: { sessions: expiredSessions.length, tokens: oldTokens.length, messages: oldMessages.length, bookings: oldBookings.length },
  });
}
