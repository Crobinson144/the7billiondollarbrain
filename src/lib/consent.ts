import "server-only";
import { headers } from "next/headers";
import { db } from "@/db";
import { consents } from "@/db/schema";
import { clientIp } from "./auth";
import { TERMS_VERSION } from "./legal";

export type ConsentKind = "SIGNUP_TERMS" | "CHECKOUT_TERMS" | "AUTO_RENEWAL";

/** Stores what the person agreed to, when, and from where. Never throws: a logging failure must not block a sale. */
export async function recordConsent(entry: { userId: string | null; email: string; kind: ConsentKind; detail?: string }) {
  try {
    const h = await headers();
    await db.insert(consents).values({
      userId: entry.userId, email: entry.email, kind: entry.kind, termsVersion: TERMS_VERSION,
      detail: (entry.detail ?? "").slice(0, 1000), ip: await clientIp(), userAgent: (h.get("user-agent") ?? "").slice(0, 300),
    });
  } catch (e) {
    console.error("Could not record consent", e);
  }
}
