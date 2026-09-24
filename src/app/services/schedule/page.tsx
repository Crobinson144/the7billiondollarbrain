import type { Metadata } from "next";
import { publishedServices } from "@/lib/queries/catalog";
import { getCurrentUser } from "@/lib/auth";
import { BookingForm } from "./BookingForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Schedule a session" };

export default async function SchedulePage({ searchParams }: { searchParams: Promise<{ service?: string }> }) {
  const [{ service }, services, user] = await Promise.all([searchParams, publishedServices(), getCurrentUser()]);
  const preselected = services.find((s) => s.slug === service)?.id ?? "";
  return (
    <div className="container-page max-w-3xl py-14">
      <p className="eyebrow">Schedule a session</p>
      <h1 className="section-title mt-2">Tell us what you need</h1>
      <p className="mt-3 text-muted">Sessions run Monday through Friday, 9:00 AM to 7:00 PM Eastern. Your first 30-minute consultation is free.</p>
      <BookingForm
        services={services.map((s) => ({ id: s.id, title: s.title }))}
        defaults={{ serviceId: preselected, name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" }}
      />
    </div>
  );
}
