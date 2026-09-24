import { describe, expect, it } from "vitest";
import { availableSlots, checkSlot, dailySlotMinutes, isValidDateString, zonedParts, zonedToUtc } from "@/lib/schedule";

const NOW = new Date("2026-10-01T12:00:00Z"); // Thursday 8:00 AM Eastern (EDT)

describe("zonedToUtc", () => {
  it("converts Eastern daylight time", () => {
    expect(zonedToUtc("2026-10-05", 9 * 60).toISOString()).toBe("2026-10-05T13:00:00.000Z");
  });
  it("converts Eastern standard time", () => {
    expect(zonedToUtc("2026-12-07", 9 * 60).toISOString()).toBe("2026-12-07T14:00:00.000Z");
  });
  it("round-trips across the November DST change", () => {
    const d = zonedToUtc("2026-11-02", 18 * 60 + 30);
    const p = zonedParts(d);
    expect([p.year, p.month, p.day, p.hour, p.minute]).toEqual([2026, 11, 2, 18, 30]);
  });
});

describe("checkSlot", () => {
  it("accepts a weekday slot in business hours", () => {
    expect(checkSlot(zonedToUtc("2026-10-05", 10 * 60), NOW)).toEqual({ ok: true });
  });
  it("accepts the last slot that ends at 7 PM", () => {
    expect(checkSlot(zonedToUtc("2026-10-05", 18 * 60 + 30), NOW).ok).toBe(true);
  });
  it("rejects weekends", () => {
    expect(checkSlot(zonedToUtc("2026-10-03", 10 * 60), NOW).ok).toBe(false);
  });
  it("rejects before 9 AM and after 7 PM", () => {
    expect(checkSlot(zonedToUtc("2026-10-05", 8 * 60 + 30), NOW).ok).toBe(false);
    expect(checkSlot(zonedToUtc("2026-10-05", 19 * 60), NOW).ok).toBe(false);
  });
  it("rejects off-grid times", () => {
    expect(checkSlot(zonedToUtc("2026-10-05", 10 * 60 + 15), NOW).ok).toBe(false);
  });
  it("requires two hours of notice and at most 60 days ahead", () => {
    expect(checkSlot(zonedToUtc("2026-10-01", 9 * 60), NOW).ok).toBe(false);
    expect(checkSlot(zonedToUtc("2026-10-01", 10 * 60), NOW).ok).toBe(true);
    expect(checkSlot(zonedToUtc("2027-01-04", 10 * 60), NOW).ok).toBe(false);
  });
});

describe("availableSlots", () => {
  it("lists 20 half-hour slots on an open weekday", () => {
    expect(dailySlotMinutes()).toHaveLength(20);
    expect(availableSlots("2026-10-05", [], NOW)).toHaveLength(20);
  });
  it("removes slots that overlap busy time", () => {
    const busy = [{ start: zonedToUtc("2026-10-05", 10 * 60 + 15), end: zonedToUtc("2026-10-05", 11 * 60) }];
    const slots = availableSlots("2026-10-05", busy, NOW).map((d) => zonedParts(d).hour * 60 + zonedParts(d).minute);
    expect(slots).not.toContain(10 * 60);
    expect(slots).not.toContain(10 * 60 + 30);
    expect(slots).toContain(11 * 60);
  });
  it("returns nothing for weekends and bad dates", () => {
    expect(availableSlots("2026-10-04", [], NOW)).toHaveLength(0);
    expect(isValidDateString("2026-02-30")).toBe(false);
    expect(availableSlots("not-a-date", [], NOW)).toHaveLength(0);
  });
});
