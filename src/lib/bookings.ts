import "server-only";
import { and, gte, lt, ne } from "drizzle-orm";
import { db } from "@/db";
import { bookings } from "@/db/schema";
import { busyIntervals } from "./calendar";
import { availableSlots, isValidDateString, zonedToUtc, type Interval } from "./schedule";

/** Everything that blocks time on a business date: active bookings plus busy time on the business calendar. */
export async function takenIntervals(date: string): Promise<Interval[]> {
  const dayStart = zonedToUtc(date, 0);
  const dayEnd = zonedToUtc(date, 24 * 60);
  const rows = await db.select({ startsAt: bookings.startsAt, durationMin: bookings.durationMin }).from(bookings)
    .where(and(gte(bookings.startsAt, dayStart), lt(bookings.startsAt, dayEnd), ne(bookings.status, "CANCELLED")));
  const own = rows.map((r) => ({ start: r.startsAt, end: new Date(r.startsAt.getTime() + r.durationMin * 60_000) }));
  let external: Interval[] = [];
  try {
    external = await busyIntervals(dayStart, dayEnd);
  } catch (e) {
    console.error("Calendar free/busy lookup failed", e);
  }
  return [...own, ...external];
}

export async function openSlots(date: string): Promise<Date[]> {
  if (!isValidDateString(date)) return [];
  return availableSlots(date, await takenIntervals(date));
}
