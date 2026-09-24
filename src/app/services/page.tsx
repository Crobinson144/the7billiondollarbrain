import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { publishedServices } from "@/lib/queries/catalog";
import { Paragraphs } from "@/components/Paragraphs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Business services" };

export default async function ServicesPage() {
  const [copy, services] = await Promise.all([getContent(["services.intro"]), publishedServices()]);
  return (
    <div className="container-page py-14">
      <p className="eyebrow">Business services</p>
      <h1 className="section-title mt-2">How we can help</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{copy["services.intro"]}</p>
      <Link href="/services/schedule" className="btn-gold mt-6">Schedule a session now</Link>
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {services.map((s) => (
          <article key={s.id} id={s.slug} className="card scroll-mt-24">
            <h2 className="text-2xl text-navy-900">{s.title}</h2>
            <p className="mt-2 text-ink">{s.summary}</p>
            {s.body && <Paragraphs text={s.body} className="mt-3 text-sm text-muted" />}
            <Link href={`/services/schedule?service=${s.slug}`} className="btn-outline mt-5">Schedule a session now</Link>
          </article>
        ))}
      </div>
    </div>
  );
}
