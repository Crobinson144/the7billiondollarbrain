/** Reads an environment variable, treating a blank or whitespace-only value as "not set". */
function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

/** Central, typed access to environment configuration. */
export const env = {
  appUrl: (read("APP_URL") ?? "http://localhost:3000").replace(/\/$/, ""),
  stripeSecretKey: read("STRIPE_SECRET_KEY") ?? "",
  stripeWebhookSecret: read("STRIPE_WEBHOOK_SECRET") ?? "",
  googleCalendarId: read("GOOGLE_CALENDAR_ID") ?? "",
  googleServiceAccountEmail: read("GOOGLE_SERVICE_ACCOUNT_EMAIL") ?? "",
  googleServiceAccountKey: (read("GOOGLE_SERVICE_ACCOUNT_KEY") ?? "").replace(/\\n/g, "\n"),
  resendApiKey: read("RESEND_API_KEY") ?? "",
  emailFrom: read("EMAIL_FROM") ?? "The 7 Billion Dollar Brain <info@the7billiondollarbrain.com>",
  adminNotifyEmail: read("ADMIN_NOTIFY_EMAIL") ?? "",
  investmentsEnabled: read("INVESTMENTS_ENABLED") === "true",
  /** Vercel sends this as a bearer token on scheduled (cron) requests. */
  cronSecret: read("CRON_SECRET") ?? "",
  isProduction: process.env.NODE_ENV === "production",
};

export const publicEnv = {
  contactPhone: read("NEXT_PUBLIC_CONTACT_PHONE") ?? "",
  contactEmail: read("NEXT_PUBLIC_CONTACT_EMAIL") ?? "info@the7billiondollarbrain.com",
  crispWebsiteId: read("NEXT_PUBLIC_CRISP_WEBSITE_ID") ?? "",
  tawkPropertyId: read("NEXT_PUBLIC_TAWK_PROPERTY_ID") ?? "",
  tawkWidgetId: read("NEXT_PUBLIC_TAWK_WIDGET_ID") ?? "default",
};

/**
 * Business details used on the legal pages, receipts and emails. Set these in Vercel once the entity is confirmed;
 * until then the pages use the trading name and omit what isn't known.
 */
export const business = {
  tradingName: "The 7 Billion Dollar Brain",
  legalName: read("BUSINESS_LEGAL_NAME") ?? "The 7 Billion Dollar Brain",
  mailingAddress: read("BUSINESS_MAILING_ADDRESS") ?? "",
  governingState: read("BUSINESS_GOVERNING_STATE") ?? "",
  venueCounty: read("BUSINESS_VENUE_COUNTY") ?? "",
};

export const integrations = {
  stripe: () => Boolean(env.stripeSecretKey),
  calendar: () => Boolean(env.googleCalendarId && env.googleServiceAccountEmail && env.googleServiceAccountKey),
  email: () => Boolean(env.resendApiKey),
};
