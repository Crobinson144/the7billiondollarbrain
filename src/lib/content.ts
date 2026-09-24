import "server-only";
import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { contentBlocks } from "@/db/schema";
import { CONTENT_DEFAULTS } from "./content-defaults";

/** Loads copy blocks by key, falling back to the defaults for anything not yet edited. */
export async function getContent<K extends string>(keys: K[]): Promise<Record<K, string>> {
  const rows = await db.select().from(contentBlocks).where(inArray(contentBlocks.key, keys));
  const found = new Map(rows.map((r) => [r.key, r.body]));
  return Object.fromEntries(keys.map((k) => [k, found.get(k) ?? CONTENT_DEFAULTS[k]?.body ?? ""])) as Record<K, string>;
}
