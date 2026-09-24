"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { db } from "@/db";
import { sessions, users } from "@/db/schema";
import { clientIp, createSession, destroySession, getCurrentUser, safeNextPath } from "@/lib/auth";
import { consumeToken, issueToken } from "@/lib/auth-tokens";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/account-emails";
import { recordConsent } from "@/lib/consent";
import { integrations, publicEnv } from "@/lib/env";
import { TERMS_VERSION } from "@/lib/legal";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";

export type AuthState = { message: string; errors?: Record<string, string>; ok?: boolean };

const passwordField = z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`).max(200);

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: z.string().trim().max(25).optional(),
  password: passwordField,
  agree: z.literal("on", { errorMap: () => ({ message: "Please agree to the Terms of Service and Privacy Policy." }) }),
});

// A fixed hash to compare against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = "$2a$12$rCT3qmDNGbaTixQQSZtqR.Cl1NE7n/XG/Z0dDed7ZWD4SqWz4.sX.";

function fieldErrors(issues: z.ZodIssue[]): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const i of issues) errors[String(i.path[0])] ??= i.message;
  return errors;
}

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 3600))) return { message: "Too many attempts. Please try again later." };
  const { name, email, phone, password } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { message: "An account with that email already exists. Log in instead.", errors: { email: "Already registered." } };
  const [user] = await db.insert(users).values({
    name, email, phone: phone || null, passwordHash: await hashPassword(password),
    termsAcceptedAt: new Date(), termsVersion: TERMS_VERSION,
  }).returning({ id: users.id });
  await recordConsent({ userId: user.id, email, kind: "SIGNUP_TERMS", detail: "Agreed to the Terms of Service and Privacy Policy at signup." });
  if (integrations.email()) await sendVerificationEmail(email, name, await issueToken(user.id, "VERIFY_EMAIL"));
  await createSession(user.id);
  redirect(safeNextPath(form.get("next")));
}

export async function login(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const ip = await clientIp();
  if (!(await rateLimit(`login:${ip}`, 20, 900)) || !(await rateLimit(`login:${email}`, 8, 900)))
    return { message: "Too many attempts. Please wait 15 minutes and try again." };
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const ok = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH);
  if (!user || !ok) return { message: "That email and password don't match." };
  await createSession(user.id);
  redirect(safeNextPath(form.get("next")));
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/");
}

const RESET_SENT = "If an account uses that email, we've sent a link to reset the password. It works for 1 hour. Check your spam folder if you don't see it.";

export async function requestPasswordReset(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = z.string().trim().toLowerCase().email().max(200).safeParse(form.get("email"));
  if (!parsed.success) return { message: "Enter a valid email address.", errors: { email: "Enter a valid email address." } };
  if (!integrations.email())
    return { message: `Password reset by email isn't switched on yet. Email us at ${publicEnv.contactEmail} from the address on your account and we'll help you get back in.` };
  const email = parsed.data;
  if (!(await rateLimit(`reset:${await clientIp()}`, 10, 3600)) || !(await rateLimit(`reset:${email}`, 3, 3600)))
    return { message: "Too many requests. Please try again in an hour." };
  const [user] = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).limit(1);
  // Send after responding, so response time doesn't reveal whether the account exists.
  if (user) after(async () => { await sendPasswordResetEmail(email, user.name, await issueToken(user.id, "RESET_PASSWORD")); });
  // Same answer either way, so the form can't be used to find out who has an account.
  return { message: RESET_SENT, ok: true };
}

const resetSchema = z.object({ token: z.string().min(10).max(200), password: passwordField, confirm: z.string() })
  .refine((v) => v.password === v.confirm, { message: "The passwords don't match.", path: ["confirm"] });

export async function resetPassword(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { message: "Please fix the highlighted fields.", errors: fieldErrors(parsed.error.issues) };
  if (!(await rateLimit(`reset-submit:${await clientIp()}`, 20, 3600))) return { message: "Too many attempts. Please try again later." };
  const userId = await consumeToken(parsed.data.token, "RESET_PASSWORD");
  if (!userId) return { message: "This reset link has expired or was already used. Request a new one." };
  const [user] = await db.select({ emailVerifiedAt: users.emailVerifiedAt }).from(users).where(eq(users.id, userId)).limit(1);
  await db.update(users).set({
    passwordHash: await hashPassword(parsed.data.password),
    // Opening the emailed link proves the address works.
    ...(user && !user.emailVerifiedAt ? { emailVerifiedAt: new Date() } : {}),
  }).where(eq(users.id, userId));
  // Sign out every device that used the old password.
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await createSession(userId);
  redirect("/account?reset=1");
}

export async function resendVerification(): Promise<AuthState> {
  const user = await getCurrentUser();
  if (!user) return { message: "Please log in again." };
  if (user.emailVerifiedAt) return { message: "Your email is already confirmed.", ok: true };
  if (!integrations.email()) return { message: "Email isn't switched on yet, so there's nothing to confirm right now." };
  if (!(await rateLimit(`verify-resend:${user.id}`, 3, 3600))) return { message: "We've sent a few already. Please check your inbox and spam folder, or try again in an hour." };
  const sent = await sendVerificationEmail(user.email, user.name, await issueToken(user.id, "VERIFY_EMAIL"));
  return sent ? { message: `We sent a new link to ${user.email}.`, ok: true } : { message: "We couldn't send the email. Please try again shortly." };
}
