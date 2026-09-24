import Link from "next/link";
import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { publishedProducts } from "@/lib/queries/catalog";
import { getCurrentUser } from "@/lib/auth";
import { formatCents } from "@/lib/money";
import { AddToCartButton } from "@/components/BuyButtons";
import type { Product } from "@/db/schema";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Products" };

function Price({ p }: { p: Product }) {
  return (
    <p className="mt-3 text-lg font-bold text-navy-900">
      {p.priceCents != null ? formatCents(p.priceCents) : "Free quote"}
      {p.priceNote && <span className="ml-2 text-sm font-normal text-muted">({p.priceNote})</span>}
    </p>
  );
}

export default async function ProductsPage() {
  const [copy, all, user] = await Promise.all([getContent(["products.intro", "products.installments"]), publishedProducts(), getCurrentUser()]);
  const visible = all.filter((p) => !p.membersOnly || user?.tier === "PREMIUM" || user?.role === "ADMIN");
  const library = visible.filter((p) => p.kind === "EBOOK" || p.kind === "VIDEO");
  const packages = visible.filter((p) => p.kind === "PACKAGE");
  const addons = visible.filter((p) => p.kind === "ADDON");
  const quotes = visible.filter((p) => p.kind === "QUOTE");

  return (
    <div className="container-page py-14">
      <p className="eyebrow">Products</p>
      <h1 className="section-title mt-2">Guides, tutorials and packages</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{copy["products.intro"]}</p>

      <section aria-labelledby="library" className="mt-12">
        <h2 id="library" className="text-2xl text-navy-900">eBooks and video tutorials</h2>
        {library.length === 0 ? (
          <p className="mt-3 text-muted">New guides and tutorials are on the way. The <Link href="/subscriptions" className="font-bold underline">Education Pass</Link> will include every one of them.</p>
        ) : (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {library.map((p) => (
              <article key={p.id} className="card flex flex-col">
                <p className="eyebrow">{p.kind === "EBOOK" ? "eBook" : "Video tutorial"}</p>
                <h3 className="mt-1 text-xl text-navy-900"><Link href={`/products/${p.slug}`} className="hover:underline">{p.name}</Link></h3>
                <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>
                <Price p={p} />
                {p.includedWithPremium && <p className="text-xs text-muted">Included with the Education Pass</p>}
                {p.priceCents != null && <div className="mt-4"><AddToCartButton productId={p.id} name={p.name} priceCents={p.priceCents} /></div>}
              </article>
            ))}
          </div>
        )}
      </section>

      {packages.length > 0 && (
        <section aria-labelledby="packages" className="mt-14">
          <h2 id="packages" className="text-2xl text-navy-900">Business packages</h2>
          <p className="mt-2 text-muted">{copy["products.installments"]}</p>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {packages.map((p) => (
              <article key={p.id} className="card">
                <h3 className="text-2xl text-navy-900">{p.name}</h3>
                <p className="mt-2 text-muted">{p.description}</p>
                <Price p={p} />
                <Link href={`/products/${p.slug}`} className="btn-gold mt-4">See what&apos;s included</Link>
              </article>
            ))}
          </div>
        </section>
      )}

      {addons.length > 0 && (
        <section aria-labelledby="addons" className="mt-14">
          <h2 id="addons" className="text-2xl text-navy-900">Add-ons</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {addons.map((p) => (
              <article key={p.id} className="card">
                <h3 className="text-lg text-navy-900">{p.name}</h3>
                <Price p={p} />
                {p.priceCents != null && <div className="mt-3"><AddToCartButton productId={p.id} name={p.name} priceCents={p.priceCents} /></div>}
              </article>
            ))}
          </div>
        </section>
      )}

      {quotes.length > 0 && (
        <section aria-labelledby="quotes" className="mt-14">
          <h2 id="quotes" className="text-2xl text-navy-900">Receive a free quote</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {quotes.map((p) => (
              <li key={p.id} className="card flex items-center justify-between gap-3 !py-4">
                <span>
                  <span className="font-bold">{p.name}</span>
                  {p.priceNote && <span className="block text-xs text-muted">{p.priceNote}</span>}
                </span>
                <Link href={`/contact?topic=${encodeURIComponent("Quote: " + p.name)}`} className="btn-outline shrink-0 whitespace-nowrap !px-3 !py-1.5">Get a quote</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
