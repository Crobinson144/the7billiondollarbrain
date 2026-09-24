/**
 * Business-hours rules for consultation bookings.
 * Sessions run Monday to Friday, 9 AM to 7 PM Eastern, in 30-minute slots.
 */
export const BUSINESS_TZ = "America/New_York";
export const OPEN_MINUTES = 9 * 60;
export const CLOSE_MINUTES = 19 * 60;
export const SLOT_MINUTES = 30;
export const MIN_LEAD_MINUTES = 120;
export const MAX_DAYS_AHEAD = 60;

type ZonedParts = { year: number; month: number; day: number; hour: number; minute: number; weekday: number };

const dtf = new Intl.DateTimeFormat("en-US", {
  timeZone: BUSINESS_TZ, hourCycle: "h23",
  year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short",
});
const WEEKDAYS: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

/** Wall-clock parts of an instant in the business time zone. */
export function zonedParts(instant: Date): ZonedParts {
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value]));
  return {
    year: Number(p.year), month: Number(p.month), day: Number(p.day),
    hour: Number(p.hour), minute: Number(p.minute), weekday: WEEKDAYS[p.weekday as string],
  };
}

/** Converts a wall-clock date and time in the business time zone to a UTC instant (DST-safe). */
export function zonedToUtc(date: string, minutesFromMidnight: number): Date {
  const [y, m, d] = date.split("-").map(Number);
  const hh = Math.floor(minutesFromMidnight / 60), mm = minutesFromMidnight % 60;
  const asUtc = Date.UTC(y, m - 1, d, hh, mm);
  let guess = asUtc;
  for (let i = 0; i < 2; i++) {
    const p = zonedParts(new Date(guess));
    const shown = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    guess += asUtc - shown;
  }
  return new Date(guess);
}

export function isValidDateString(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [y, m, d] = date.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d));
  return t.getUTCFullYear() === y && t.getUTCMonth() === m - 1 && t.getUTCDate() === d;
}

/** All slot start times (minutes from midnight) in a business day. */
export function dailySlotMinutes(durationMin = SLOT_MINUTES): number[] {
  const out: number[] = [];
  for (let t = OPEN_MINUTES; t + durationMin <= CLOSE_MINUTES; t += SLOT_MINUTES) out.push(t);
  return out;
}

export type SlotCheck = { ok: true } | { ok: false; reason: string };

/** Checks that a proposed start falls inside business hours, on a slot boundary, and in the booking window. */
export function checkSlot(start: Date, now: Date = new Date(), durationMin = SLOT_MINUTES): SlotCheck {
  if (Number.isNaN(start.getTime())) return { ok: false, reason: "Invalid date or time." };
  const p = zonedParts(start);
  if (p.weekday === 0 || p.weekday === 6) return { ok: false, reason: "Sessions are available Monday through Friday." };
  const minutes = p.hour * 60 + p.minute;
  if (minutes < OPEN_MINUTES || minutes + durationMin > CLOSE_MINUTES)
    return { ok: false, reason: "Sessions are available from 9:00 AM to 7:00 PM Eastern." };
  if (minutes % SLOT_MINUTES !== 0 || start.getUTCSeconds() !== 0 || start.getUTCMilliseconds() !== 0)
    return { ok: false, reason: "Please choose one of the listed times." };
  if (start.getTime() < now.getTime() + MIN_LEAD_MINUTES * 60_000)
    return { ok: false, reason: "Please choose a time at least 2 hours from now." };
  if (start.getTime() > now.getTime() + MAX_DAYS_AHEAD * 86_400_000)
    return { ok: false, reason: `Sessions can be booked up to ${MAX_DAYS_AHEAD} days ahead.` };
  return { ok: true };
}

export type Interval = { start: Date; end: Date };

/** Open slots on a given business date, excluding taken or busy intervals. */
export function availableSlots(date: string, taken: Interval[], now: Date = new Date(), durationMin = SLOT_MINUTES): Date[] {
  if (!isValidDateString(date)) return [];
  return dailySlotMinutes(durationMin)
    .map((m) => zonedToUtc(date, m))
    .filter((start) => checkSlot(start, now, durationMin).ok)
    .filter((start) => {
      const end = start.getTime() + durationMin * 60_000;
      return !taken.some((b) => start.getTime() < b.end.getTime() && end > b.start.getTime());
    });
}

export function formatSlot(start: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: BUSINESS_TZ, weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short",
  }).format(start);
}
