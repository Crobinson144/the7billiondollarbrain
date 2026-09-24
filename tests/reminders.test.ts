import { describe, expect, it } from "vitest";
import { dueForAnnualReminder } from "../src/lib/reminders";
import { autoRenewalDisclosure, fixedTermDisclosure } from "../src/lib/legal";

const d = (s: string) => new Date(s);

describe("dueForAnnualReminder", () => {
  const start = d("2025-10-01T15:00:00Z");
  it("is due 5 to 14 days before the anniversary", () => {
    expect(dueForAnnualReminder(start, null, d("2026-09-24T12:00:00Z"))).toBe(true);
    expect(dueForAnnualReminder(start, null, d("2026-09-17T12:00:00Z"))).toBe(false);
    expect(dueForAnnualReminder(start, null, d("2026-09-28T12:00:00Z"))).toBe(false);
  });
  it("isn't due in the first year or twice in a year", () => {
    expect(dueForAnnualReminder(d("2026-09-01T00:00:00Z"), null, d("2026-09-24T12:00:00Z"))).toBe(false);
    expect(dueForAnnualReminder(start, d("2026-09-20T12:00:00Z"), d("2026-09-24T12:00:00Z"))).toBe(false);
  });
  it("finds later anniversaries", () => {
    expect(dueForAnnualReminder(start, d("2026-09-22T12:00:00Z"), d("2027-09-24T12:00:00Z"))).toBe(true);
  });
});

describe("billing disclosures", () => {
  it("say how open-ended plans renew and how to cancel", () => {
    const text = autoRenewalDisclosure("$21.99");
    expect(text).toContain("$21.99 per month");
    expect(text).toMatch(/automatically every month until you cancel/);
    expect(text).toMatch(/Manage billing/);
  });
  it("say fixed-term plans end on their own", () => {
    expect(fixedTermDisclosure("$1,000.00", 12)).toMatch(/12 monthly payments of \$1,000\.00.*does not renew/);
  });
});
