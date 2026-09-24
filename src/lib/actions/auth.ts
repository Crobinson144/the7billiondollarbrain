"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { clientIp, createSession, destroySession, safeNextPath } from "@/lib/auth";
import { hashPassword, PASSWORD_MIN_LENGTH, verifyPassword } from "@/lib/password";
import { rateLimit } from "@/lib/ratelimit";

export type AuthState = { message: string; errors?: Record<string, string> };

const signupSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: z.string().trim().max(25).optional(),
  password: z.string().min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters.`).max(200),
});

// A fixed hash to compare against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = "$2a$12$rCT3qmDNGbaTixQQSZtqR.Cl1NE7n/XG/Z0dDed7ZWD4SqWz4.sX.";

export async function signup(_prev: AuthState, form: FormData): Promise<AuthState> {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { message: "Please fix the highlighted fields.", errors };
  }
  if (!(await rateLimit(`signup:${await clientIp()}`, 10, 3600))) return { message: "Too many attempts. Please try again later." };
  const { name, email, phone, password } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) return { message: "An account with that email already exists. Log in instead.", errors: { email: "Already registered." } };
  const [user] = await db.insert(users).values({ name, email, phone: phone || null, passwordHash: await hashPassword(password) })
    .returning({ id: users.id });
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
