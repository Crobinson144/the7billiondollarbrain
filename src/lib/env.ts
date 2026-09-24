/** Central, typed access to environment configuration. */
export const env = {
  appUrl: (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  googleCalendarId: process.env.GOOGLE_CALENDAR_ID ?? "",
  googleServiceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
  googleServiceAccountKey: (process.env.GOOGLE_SERVICE_ACCOUNT_KEY ?? "").replace(/\\n/g, "\n"),
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "The 7 Billion Dollar Brain <info@the7billiondollarbrain.com>",
  adminNotifyEmail: process.env.ADMIN_NOTIFY_EMAIL ?? "",
  investmentsEnabled: process.env.INVESTMENTS_ENABLED === "true",
  isProduction: process.env.NODE_ENV === "production",
};

export const publicEnv = {
  contactPhone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "info@the7billiondollarbrain.com",
  crispWebsiteId: process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID ?? "",
  tawkPropertyId: process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID ?? "",
  tawkWidgetId: process.env.NEXT_PUBLIC_TAWK_WIDGET_ID ?? "default",
};

export const integrations = {
  stripe: () => Boolean(env.stripeSecretKey),
  calendar: () => Boolean(env.googleCalendarId && env.googleServiceAccountEmail && env.googleServiceAccountKey),
  email: () => Boolean(env.resendApiKey),
};
