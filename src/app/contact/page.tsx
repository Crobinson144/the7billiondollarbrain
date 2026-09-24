import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { publicEnv } from "@/lib/env";
import { OpenChatButton } from "@/components/ChatWidget";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact us" };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const [copy, { topic }] = await Promise.all([getContent(["contact.intro"]), searchParams]);
  const chatEnabled = Boolean(publicEnv.crispWebsiteId || publicEnv.tawkPropertyId);
  return (
    <div className="container-page max-w-4xl py-14">
      <p className="eyebrow">Contact us</p>
      <h1 className="section-title mt-2">Let&apos;s talk</h1>
      <p className="mt-3 text-lg text-muted">{copy["contact.intro"]}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card">
          <h2 className="text-lg text-navy-900">Live chat</h2>
          {chatEnabled ? <div className="mt-3"><OpenChatButton /></div> : <p className="mt-2 text-sm text-muted">Live chat is coming soon.</p>}
        </div>
        <div className="card">
          <h2 className="text-lg text-navy-900">Call us</h2>
          {publicEnv.contactPhone
            ? <a href={`tel:${publicEnv.contactPhone}`} className="mt-2 block font-bold text-navy-900 underline">{publicEnv.contactPhone}</a>
            : <p className="mt-2 text-sm text-muted">Phone line coming soon.</p>}
        </div>
        <div className="card">
          <h2 className="text-lg text-navy-900">Email us</h2>
          <a href={`mailto:${publicEnv.contactEmail}`} className="mt-2 block break-all font-bold text-navy-900 underline">{publicEnv.contactEmail}</a>
        </div>
      </div>
      <ContactForm topic={topic ?? ""} />
    </div>
  );
}
