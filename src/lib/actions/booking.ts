"use server";

import { pgErrorCode, UNIQUE_VIOLATION } from "@/lib/pg-errors";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services } from "@/db/schema";
import { clientIp, getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import { checkSlot, formatSlot, SLOT_MINUTES, zonedParts } from "@/lib/schedule";
import { takenIntervals } from "@/lib/bookings";
import { createCalendarEvent } from "@/lib/calendar";
import { sendEmail } from "@/lib/email";
import { env } from "@/lib/env";

export type BookingState = { ok: boolean; message: string; errors?: Record<string, string> };

const schema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(120),
  address: z.string().trim().min(5, "Enter your address.").max(300),
  phone: z.string().trim().regex(/^[0-9+().\-\s]{7,25}$/, "Enter a valid phone number."),
  email: z.string().trim().toLowerCase().email("Enter a valid email address.").max(200),
  inquiry: z.string().trim().min(5, "Tell us a little about your question.").max(4000),
  serviceId: z.string().min(1, "Choose a service."),
  start: z.string().min(1, "Choose a date and time."),
  website: z.string().max(0).optional(), // honeypot
});

export async function createBooking(_prev: BookingState, form: FormData): Promise<BookingState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }
  const data = parsed.data;
  if (!(await rateLimit(`booking:${await clientIp()}`, 5, 3600)))
    return { ok: false, message: "Too many booking attempts. Please try again later or contact us." };

  const [service] = await db.select().from(services).where(and(eq(services.id, data.serviceId), eq(services.published, true))).limit(1);
  if (!service) return { ok: false, message: "That service is no longer available.", errors: { serviceId: "Choose a service." } };

  const start = new Date(data.start);
  const check = checkSlot(start);
  if (!check.ok) return { ok: false, message: check.reason, errors: { start: check.reason } };

  const p = zonedParts(start);
  const date = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  const end = start.getTime() + SLOT_MINUTES * 60_000;
  const taken = await takenIntervals(date);
  if (taken.some((t) => start.getTime() < t.end.getTime() && end > t.start.getTime()))
    return { ok: false, message: "That time was just taken. Please choose another.", errors: { start: "No longer available." } };

  const user = await getCurrentUser();
  let bookingId: string;
  try {
    const [row] = await db.insert(bookings).values({
      userId: user?.id ?? null, serviceId: service.id, name: data.name, address: data.address,
      phone: data.phone, email: data.email, inquiry: data.inquiry, startsAt: start, durationMin: SLOT_MINUTES,
    }).returning({ id: bookings.id });
    bookingId = row.id;
  } catch (e) {
    // The unique slot index rejects a booking that raced another one for the same time.
    if (pgErrorCode(e) === UNIQUE_VIOLATION)
      return { ok: false, message: "That time was just taken. Please choose another.", errors: { start: "No longer available." } };
    throw e;
  }

  const when = formatSlot(start);
  try {
    const eventId = await createCalendarEvent({
      start, durationMin: SLOT_MINUTES, attendeeEmail: data.email,
      summary: `${service.title}: ${data.name}`,
      description: [`Service: ${service.title}`, `Name: ${data.name}`, `Phone: ${data.phone}`, `Email: ${data.email}`, `Address: ${data.address}`, "", data.inquiry].join("\n"),
    });
    if (eventId) await db.update(bookings).set({ calendarEventId: eventId, status: "CONFIRMED" }).where(eq(bookings.id, bookingId));
  } catch (e) {
    console.error("Calendar event creation failed", e);
  }

  await Promise.all([
    sendEmail(data.email, "Your session with The 7 Billion Dollar Brain",
      `Hi ${data.name},\n\nThanks for scheduling a ${service.title} session for ${when}.\nWe'll contact you at ${data.phone} or this email if anything changes.\n\nThe 7 Billion Dollar Brain`),
    sendEmail(env.adminNotifyEmail, `New booking: ${service.title}, ${when}`,
      `${data.name} (${data.email}, ${data.phone})\n${data.address}\n\n${data.inquiry}`),
  ]);

  return { ok: true, message: `You're booked for ${when}. A confirmation is on its way to ${data.email}.` };
}
