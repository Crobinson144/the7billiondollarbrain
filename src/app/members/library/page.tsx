import Link from "next/link";
import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { canAccessProduct } from "@/lib/access";
import { publishedProducts } from "@/lib/queries/catalog";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Members library" };

export default async function LibraryPage() {
  const user = await requireUser("/members/library");
  const items = (await publishedProducts()).filter((p) => p.kind === "EBOOK" || p.kind === "VIDEO");
  const access = await Promise.all(items.map((p) => canAccessProduct(user, p)));
  return (
    <div className="container-page py-14">
      <p className="eyebrow">{user.tier === "PREMIUM" ? "Premium member" : "Basic member"}</p>
      <h1 className="section-title mt-1">Members library</h1>
      {user.tier === "BASIC" && (
        <p className="mt-3 text-muted">Basic members can open anything they've bought. The <Link href="/subscriptions#education-pass" className="font-bold underline">Education Pass</Link> unlocks the whole library.</p>
      )}
      {items.length === 0 ? <p className="mt-8 text-muted">The library is being stocked. New guides and tutorials will appear here.</p> : (
        <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p, i) => (
            <li key={p.id} className="card flex flex-col">
              <p className="eyebrow">{p.kind === "EBOOK" ? "eBook" : "Video"}</p>
              <h2 className="mt-1 text-lg text-navy-900">{p.name}</h2>
              <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>
              {access[i] && p.contentUrl
                ? <a href={p.contentUrl} target="_blank" rel="noopener noreferrer" className="btn-gold mt-4">Open</a>
                : <Link href={`/products/${p.slug}`} className="btn-outline mt-4">{access[i] ? "Details" : "Get access"}</Link>}
            </li>
          ))}
        </ul>
      )}
      {env.investmentsEnabled && <Link href="/members/investments" className="btn-navy mt-10">Investment opportunities</Link>}
    </div>
  );
}
