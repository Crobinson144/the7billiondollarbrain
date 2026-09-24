"use server";

import { FOREIGN_KEY_VIOLATION, pgErrorCode, UNIQUE_VIOLATION } from "@/lib/pg-errors";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { bookings, contactMessages, contentBlocks, users } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";
import { cancelCalendarEvent } from "@/lib/calendar";
import { CONTENT_DEFAULTS } from "@/lib/content-defaults";
import { isResourceKey, parseResourceForm, RESOURCES } from "@/lib/admin/resources";

export type AdminFormState = { message: string; errors?: Record<string, string> };

export async function saveResource(resource: string, id: string | null, _prev: AdminFormState, form: FormData): Promise<AdminFormState> {
  await requireAdmin();
  if (!isResourceKey(resource)) return { message: "Unknown section." };
  const config = RESOURCES[resource];
  const parsed = parseResourceForm(config.fields, form);
  if (!parsed.ok) return { message: "Please fix the highlighted fields.", errors: parsed.errors };
  // The table differs per resource; values were validated against that resource's own field list.
  const table = config.table as typeof RESOURCES.services.table;
  try {
    if (id) await db.update(table).set(parsed.values as never).where(eq(table.id, id));
    else await db.insert(table).values(parsed.values as never);
  } catch (e) {
    if (pgErrorCode(e) === UNIQUE_VIOLATION) return { message: "That URL slug is already used.", errors: { slug: "Already used." } };
    throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${resource}`);
}

export async function deleteResource(resource: string, id: string): Promise<void> {
  await requireAdmin();
  if (!isResourceKey(resource)) return;
  const table = RESOURCES[resource].table as typeof RESOURCES.services.table;
  try {
    await db.delete(table).where(eq(table.id, id));
  } catch (e) {
    // Plans with subscriptions can't be deleted; unpublish instead.
    if (pgErrorCode(e) === FOREIGN_KEY_VIOLATION) {
      await db.update(table).set({ published: false } as never).where(eq(table.id, id));
    } else throw e;
  }
  revalidatePath("/", "layout");
  redirect(`/admin/${resource}`);
}

export async function saveContent(form: FormData): Promise<void> {
  await requireAdmin();
  const key = String(form.get("key") ?? "");
  const body = String(form.get("body") ?? "").trim();
  const def = CONTENT_DEFAULTS[key];
  if (!def || !body || body.length > 20000) return;
  await db.insert(contentBlocks).values({ key, label: def.label, body })
    .onConflictDoUpdate({ target: contentBlocks.key, set: { body } });
  revalidatePath("/", "layout");
}

export async function setBookingStatus(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  if (!["REQUESTED", "CONFIRMED", "CANCELLED"].includes(status)) return;
  const [b] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);
  if (!b) return;
  if (status === "CANCELLED" && b.calendarEventId) {
    try { await cancelCalendarEvent(b.calendarEventId); } catch (e) { console.error("Calendar cancel failed", e); }
  }
  try {
    await db.update(bookings).set({ status: status as "REQUESTED" | "CONFIRMED" | "CANCELLED" }).where(eq(bookings.id, id));
  } catch (e) {
    // Re-activating a cancelled booking whose slot has since been taken.
    if (pgErrorCode(e) !== UNIQUE_VIOLATION) throw e;
  }
  revalidatePath("/admin/bookings");
}

export async function updateUserAccess(form: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const tier = String(form.get("tierOverride") ?? "");
  const role = String(form.get("role") ?? "");
  if (!["", "BASIC", "PREMIUM"].includes(tier) || !["MEMBER", "ADMIN"].includes(role)) return;
  // Admins can't remove their own admin access by accident.
  const safeRole = id === admin.id ? "ADMIN" : role;
  await db.update(users).set({
    tierOverride: tier === "" ? null : (tier as "BASIC" | "PREMIUM"),
    role: safeRole as "MEMBER" | "ADMIN",
  }).where(eq(users.id, id));
  revalidatePath("/admin/users");
}

export async function markMessageHandled(form: FormData): Promise<void> {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  await db.update(contactMessages).set({ handled: form.get("handled") === "true" }).where(eq(contactMessages.id, id));
  revalidatePath("/admin/messages");
}
