"use server";

import { z } from "zod";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { clientIp } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export type ContactState = { ok: boolean; message: string; errors?: Record<string, string> };

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  phone: z.string().trim().max(25).optional().default(""),
  message: z.string().trim().min(5, "Enter a message.").max(5000),
  website: z.string().max(0).optional(),
});

export async function sendContact(_prev: ContactState, form: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  if (!(await rateLimit(`contact:${await clientIp()}`, 5, 3600))) return { ok: false, message: "Too many messages. Please try again later." };
  const { name, email, phone, message } = parsed.data;
  await db.insert(contactMessages).values({ name, email, phone, message });
  await sendEmail(env.adminNotifyEmail, `Website message from ${name}`, `${name} <${email}> ${phone}\n\n${message}`);
  return { ok: true, message: "Thanks, your message was sent. We'll reply by email." };
}
