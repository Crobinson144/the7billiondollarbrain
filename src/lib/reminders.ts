const DAY = 86_400_000;

/**
 * True when a subscription's yearly anniversary is 5 to 14 days away and no reminder has gone out in the last
 * 300 days. The window is wide enough that a missed daily run still sends the reminder before the anniversary.
 */
export function dueForAnnualReminder(startedAt: Date, lastSentAt: Date | null, now: Date): boolean {
  if (lastSentAt && now.getTime() - lastSentAt.getTime() < 300 * DAY) return false;
  if (now.getTime() - startedAt.getTime() < 300 * DAY) return false;
  let next = new Date(startedAt);
  while (next.getTime() <= now.getTime()) next = new Date(Date.UTC(next.getUTCFullYear() + 1, next.getUTCMonth(), next.getUTCDate(), next.getUTCHours()));
  const daysAway = (next.getTime() - now.getTime()) / DAY;
  return daysAway >= 5 && daysAway <= 14;
}
