import "server-only";
import { sendEmail } from "./email";
import { env, publicEnv } from "./env";

export function sendVerificationEmail(to: string, name: string, token: string): Promise<boolean> {
  const link = `${env.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
  return sendEmail(to, "Confirm your email for The 7 Billion Dollar Brain", [
    `Hi ${name.split(" ")[0]},`,
    "",
    "Please confirm your email address by opening this link:",
    link,
    "",
    "The link works for 3 days. If you didn't create an account, you can ignore this email.",
    "",
    `The 7 Billion Dollar Brain · ${publicEnv.contactEmail}`,
  ].join("\n"));
}

export function sendPasswordResetEmail(to: string, name: string, token: string): Promise<boolean> {
  const link = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
  return sendEmail(to, "Reset your password for The 7 Billion Dollar Brain", [
    `Hi ${name.split(" ")[0]},`,
    "",
    "Someone asked to reset the password for your account. To choose a new password, open this link:",
    link,
    "",
    "The link works for 1 hour and can be used once. If you didn't ask for this, you can ignore this email; your password hasn't changed.",
    "",
    `The 7 Billion Dollar Brain · ${publicEnv.contactEmail}`,
  ].join("\n"));
}
