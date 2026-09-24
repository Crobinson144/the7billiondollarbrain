import Link from "next/link";
import { business, publicEnv } from "@/lib/env";
import { LEGAL_EFFECTIVE_DATE } from "@/lib/legal";

/** Shared frame for the legal pages: title, effective date and a readable single column. */
export function LegalPage({ title, intro, children }: { title: string; intro?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-14">
      <p className="eyebrow">Legal</p>
      <h1 className="section-title mt-2">{title}</h1>
      <p className="mt-2 text-sm text-muted">Effective {LEGAL_EFFECTIVE_DATE}</p>
      {intro && <div className="mt-6 text-lg">{intro}</div>}
      <div className="legal mt-8 space-y-8">{children}</div>
      <nav aria-label="Legal pages" className="mt-12 flex flex-wrap gap-4 border-t border-line pt-6 text-sm font-bold">
        <Link href="/terms" className="underline">Terms of Service</Link>
        <Link href="/privacy" className="underline">Privacy Policy</Link>
        <Link href="/refunds" className="underline">Refund and Cancellation Policy</Link>
        <Link href="/accessibility" className="underline">Accessibility</Link>
      </nav>
    </div>
  );
}

export function Section({ id, title, children }: { id?: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-2xl text-navy-900">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: React.ReactNode[] }) {
  return <ul className="list-disc space-y-1.5 pl-6">{items.map((item, i) => <li key={i}>{item}</li>)}</ul>;
}

/** How to reach the business; shows the mailing address and phone once they're configured. */
export function ContactDetails() {
  return (
    <address className="not-italic">
      <strong>{business.legalName}</strong>
      {business.legalName !== business.tradingName && <> (doing business as {business.tradingName})</>}
      <br />
      Email: <a href={`mailto:${publicEnv.contactEmail}`} className="underline">{publicEnv.contactEmail}</a>
      {publicEnv.contactPhone && <><br />Phone: <a href={`tel:${publicEnv.contactPhone}`} className="underline">{publicEnv.contactPhone}</a></>}
      {business.mailingAddress && <><br />Mail: {business.mailingAddress}</>}
      <br />Or use the <Link href="/contact" className="underline">contact page</Link>.
    </address>
  );
}

export function governingLawText(): string {
  const state = business.governingState ? `the State of ${business.governingState}` : `the state in which ${business.legalName} is organized`;
  return `These Terms are governed by the laws of ${state}, without regard to its conflict-of-laws rules, and by applicable federal law.`;
}

export function venueText(): string {
  const place = business.governingState
    ? `${business.venueCounty ? `${business.venueCounty} County, ` : ""}${business.governingState}`
    : "the state and county where our principal office is located";
  return `Any lawsuit that isn't brought in small claims court must be filed in the state or federal courts located in ${place}, and you and we consent to those courts' jurisdiction.`;
}
