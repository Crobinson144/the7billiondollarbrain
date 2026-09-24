import Link from "next/link";
import type { Metadata } from "next";
import { searchSite } from "@/lib/search";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").slice(0, 100);
  const hits = await searchSite(q);
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="section-title">Search</h1>
      <form action="/search" role="search" className="mt-6 flex gap-2">
        <label htmlFor="q" className="sr-only">Search the site</label>
        <input id="q" name="q" type="search" defaultValue={q} className="field" placeholder="Try: business plan, hiring, logo" />
        <button className="btn-navy">Search</button>
      </form>
      {q.trim().length >= 2 && (
        <p className="mt-6 text-sm text-muted">{hits.length} result{hits.length === 1 ? "" : "s"} for “{q}”</p>
      )}
      <ul className="mt-4 space-y-3">
        {hits.map((h, i) => (
          <li key={`${h.href}-${i}`} className="card !p-4">
            <p className="eyebrow">{h.type}</p>
            <Link href={h.href} className="text-lg font-bold text-navy-900 hover:underline">{h.title}</Link>
            {h.snippet && <p className="mt-1 line-clamp-2 text-sm text-muted">{h.snippet}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
