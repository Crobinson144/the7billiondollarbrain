import { NextResponse } from "next/server";
import { pool } from "@/db";

export const dynamic = "force-dynamic";

/**
 * Uptime check. Runs one query so monitors see database outages, and the Vercel cron in vercel.json calls it
 * every six hours so a free Supabase project always has activity and is never paused.
 */
export async function GET() {
  const headers = { "Cache-Control": "no-store" };
  try {
    await pool.query("select 1");
    return NextResponse.json({ ok: true }, { headers });
  } catch (e) {
    console.error("Health check failed:", (e as Error).message);
    return NextResponse.json({ ok: false }, { status: 503, headers });
  }
}
