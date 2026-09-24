import { NextResponse } from "next/server";
import { openSlots } from "@/lib/bookings";
import { formatSlot } from "@/lib/schedule";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get("date") ?? "";
  const slots = await openSlots(date);
  return NextResponse.json(
    { slots: slots.map((s) => ({ start: s.toISOString(), label: formatSlot(s) })) },
    { headers: { "Cache-Control": "no-store" } },
  );
}
