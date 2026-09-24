import type { Metadata } from "next";
import Link from "next/link";
import { getContent } from "@/lib/content";
import { publishedTeam } from "@/lib/queries/catalog";
import { Paragraphs } from "@/components/Paragraphs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const [copy, team] = await Promise.all([getContent(["about.body"]), publishedTeam()]);
  return (
    <div className="container-page max-w-4xl py-14">
      <p className="eyebrow">About us</p>
      <h1 className="section-title mt-2">Meet the team</h1>
      <Paragraphs text={copy["about.body"]} className="mt-6 text-lg" />
      {team.length > 0 && (
        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {team.map((m) => (
            <article key={m.id} className="card">
              <h2 className="text-xl text-navy-900">{m.name}</h2>
              <p className="text-sm font-bold text-gold-500">{m.role}</p>
              {m.bio && <Paragraphs text={m.bio} className="mt-3 text-sm text-muted" />}
            </article>
          ))}
        </div>
      )}
      <Link href="/services/schedule" className="btn-gold mt-10">Schedule a free consultation</Link>
    </div>
  );
}
