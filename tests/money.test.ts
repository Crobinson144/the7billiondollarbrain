import { describe, expect, it } from "vitest";
import { addMonthsUtc, fixedTermCancelAt, formatCents, isInstallmentCount, splitInstallments } from "@/lib/money";

describe("splitInstallments", () => {
  it("charges exactly the total", () => {
    for (const [total, n] of [[379900, 3], [379900, 9], [325000, 6], [100001, 3]] as const) {
      const { monthlyCents, firstPaymentExtraCents } = splitInstallments(total, n);
      expect(monthlyCents * n + firstPaymentExtraCents).toBe(total);
      expect(firstPaymentExtraCents).toBeGreaterThanOrEqual(0);
      expect(firstPaymentExtraCents).toBeLessThan(n);
    }
  });
  it("splits $3,799 into 3 payments of $1,266.33 plus 1 cent", () => {
    expect(splitInstallments(379900, 3)).toEqual({ monthlyCents: 126633, firstPaymentExtraCents: 1, firstPaymentCents: 126634 });
  });
  it("rejects invalid input", () => {
    expect(() => splitInstallments(0, 3)).toThrow();
    expect(() => splitInstallments(1000, 0)).toThrow();
  });
});

describe("installment options", () => {
  it("allows 1, 3, 6 and 9 only", () => {
    expect([1, 3, 6, 9].every(isInstallmentCount)).toBe(true);
    expect([0, 2, 12].some(isInstallmentCount)).toBe(false);
  });
});

describe("fixed-term billing dates", () => {
  it("clamps to month end", () => {
    expect(addMonthsUtc(new Date("2026-01-31T00:00:00Z"), 1).toISOString()).toBe("2026-02-28T00:00:00.000Z");
  });
  it("stops one hour before the payment after the last one", () => {
    const start = new Date("2026-10-05T15:00:00Z");
    expect(fixedTermCancelAt(start, 3).toISOString()).toBe("2027-01-05T14:00:00.000Z");
  });
});

describe("formatCents", () => {
  it("formats whole and fractional dollars", () => {
    expect(formatCents(379900)).toBe("$3,799");
    expect(formatCents(2199)).toBe("$21.99");
  });
});
