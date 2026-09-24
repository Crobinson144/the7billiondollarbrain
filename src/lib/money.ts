export function formatCents(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency", currency: "USD",
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2, maximumFractionDigits: 2,
  }).format(cents / 100);
}

export const INSTALLMENT_OPTIONS = [1, 3, 6, 9] as const;
export type InstallmentCount = (typeof INSTALLMENT_OPTIONS)[number];

export function isInstallmentCount(n: number): n is InstallmentCount {
  return (INSTALLMENT_OPTIONS as readonly number[]).includes(n);
}

/**
 * Splits a total into equal monthly payments without over- or under-charging.
 * Every month is `monthlyCents`; the first payment also carries `firstPaymentExtraCents`
 * (0 to count-1 cents) so the payments add up to exactly the total.
 */
export function splitInstallments(totalCents: number, count: number) {
  if (!Number.isInteger(totalCents) || totalCents <= 0) throw new Error("Total must be a positive whole number of cents");
  if (!Number.isInteger(count) || count < 1) throw new Error("Installment count must be a positive integer");
  const monthlyCents = Math.floor(totalCents / count);
  const firstPaymentExtraCents = totalCents - monthlyCents * count;
  return { monthlyCents, firstPaymentExtraCents, firstPaymentCents: monthlyCents + firstPaymentExtraCents };
}

/** Adds calendar months in UTC, clamping to the last day of shorter months. */
export function addMonthsUtc(date: Date, months: number): Date {
  const d = new Date(date.getTime());
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d;
}

/**
 * When a fixed-term Stripe subscription (installments or a 3/6/12-month plan) should stop:
 * one hour before the payment that would exceed `payments`, so exactly `payments` are charged.
 */
export function fixedTermCancelAt(periodStart: Date, payments: number): Date {
  return new Date(addMonthsUtc(periodStart, payments).getTime() - 60 * 60 * 1000);
}
