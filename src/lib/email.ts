import "server-only";
import { env, integrations } from "./env";

/** Sends a plain-text email through Resend. Logs and returns false when email isn't configured or fails. */
export async function sendEmail(to: string, subject: string, text: string): Promise<boolean> {
  if (!integrations.email() || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.resendApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.emailFrom, to: [to], subject, text }),
    });
    if (!res.ok) console.error("Email failed", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("Email failed", e);
    return false;
  }
}
