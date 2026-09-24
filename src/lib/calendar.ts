import "server-only";
import { JWT } from "google-auth-library";
import { env, integrations } from "./env";
import type { Interval } from "./schedule";

const SCOPES = ["https://www.googleapis.com/auth/calendar"];
const API = "https://www.googleapis.com/calendar/v3";

function authClient() {
  return new JWT({ email: env.googleServiceAccountEmail, key: env.googleServiceAccountKey, scopes: SCOPES });
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const { token } = await authClient().getAccessToken();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google Calendar ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}

/** Busy intervals on the business calendar between two instants. Empty when not configured. */
export async function busyIntervals(from: Date, to: Date): Promise<Interval[]> {
  if (!integrations.calendar()) return [];
  const data = await call<{ calendars: Record<string, { busy: { start: string; end: string }[] }> }>("/freeBusy", {
    method: "POST",
    body: JSON.stringify({ timeMin: from.toISOString(), timeMax: to.toISOString(), items: [{ id: env.googleCalendarId }] }),
  });
  return (data.calendars[env.googleCalendarId]?.busy ?? []).map((b) => ({ start: new Date(b.start), end: new Date(b.end) }));
}

/** Adds a booking to the business calendar and returns the event id, or null when not configured. */
export async function createCalendarEvent(input: {
  start: Date; durationMin: number; summary: string; description: string; attendeeEmail: string;
}): Promise<string | null> {
  if (!integrations.calendar()) return null;
  const end = new Date(input.start.getTime() + input.durationMin * 60_000);
  const event = await call<{ id: string }>(`/calendars/${encodeURIComponent(env.googleCalendarId)}/events`, {
    method: "POST",
    body: JSON.stringify({
      summary: input.summary,
      description: input.description,
      start: { dateTime: input.start.toISOString() },
      end: { dateTime: end.toISOString() },
    }),
  });
  return event.id;
}

export async function cancelCalendarEvent(eventId: string): Promise<void> {
  if (!integrations.calendar() || !eventId) return;
  const { token } = await authClient().getAccessToken();
  await fetch(`${API}/calendars/${encodeURIComponent(env.googleCalendarId)}/events/${encodeURIComponent(eventId)}`, {
    method: "DELETE", headers: { Authorization: `Bearer ${token}` },
  });
}
