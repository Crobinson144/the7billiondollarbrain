/** Bump TERMS_VERSION whenever the Terms, Privacy Policy or Refund Policy change materially. */
export const TERMS_VERSION = "2026-09-24";
export const LEGAL_EFFECTIVE_DATE = "September 24, 2026";

/** The text shown next to an open-ended plan's consent box and on the Stripe checkout page. */
export function autoRenewalDisclosure(monthlyPrice: string): string {
  return `${monthlyPrice} per month, charged today and then automatically every month until you cancel. Cancel anytime online from My account → Manage billing; cancellation takes effect at the end of the month you've paid for.`;
}

export function fixedTermDisclosure(monthlyPrice: string, months: number): string {
  return `${months} monthly payments of ${monthlyPrice}, starting today. Billing stops automatically after the last payment; this plan does not renew.`;
}
