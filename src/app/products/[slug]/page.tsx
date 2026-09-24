import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { productBySlug } from "@/lib/queries/catalog";
import { getCurrentUser } from "@/lib/auth";
import { canAccessProduct } from "@/lib/access";
import { formatCents, splitInstallments } from "@/lib/money";
import { AddToCartButton, BuyNowPackage } from "@/components/BuyButtons";
import { Paragraphs } from "@/components/Paragraphs";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = await productBySlug((await params).slug);
  return { title: p?.name ?? "Product", description: p?.description };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const [p, user] = await Promise.all([productBySlug((await params).slug), getCurrentUser()]);
  if (!p) notFound();
  if (p.membersOnly && user?.tier !== "PREMIUM" && user?.role !== "ADMIN") notFound();
  const features = p.features.split("\n").map((f) => f.trim()).filter(Boolean);
  const isLibrary = p.kind === "EBOOK" || p.kind === "VIDEO";
  const hasAccess = isLibrary && (await canAccessProduct(user, p));
  const installmentLabels: Record<number, string> = {};
  if (p.priceCents && p.allowInstallments) {
    for (const n of [3, 6, 9]) {
      const s = splitInstallments(p.priceCents, n);
      installmentLabels[n] = `${formatCents(s.monthlyCents)}/mo`;
    }
  }

  return (
    <div className="container-page max-w-3xl py-14">
      <Link href="/products" className="text-sm font-bold text-muted hover:text-navy-900">← All products</Link>
      <h1 className="section-title mt-4">{p.name}</h1>
      {p.description && <Paragraphs text={p.description} className="mt-4 text-lg text-muted" />}
      {features.length > 0 && (
        <ul className="mt-6 list-disc space-y-2 pl-6">{features.map((f) => <li key={f}>{f}</li>)}</ul>
      )}
      <p className="mt-6 text-2xl font-bold text-navy-900">
        {p.priceCents === 0 ? "Free with an account" : p.priceCents != null ? formatCents(p.priceCents) : p.membersOnly && p.includedWithPremium ? "Included with the Education Pass" : "Free quote"}
        {p.priceNote && <span className="ml-2 text-base font-normal text-muted">({p.priceNote})</span>}
      </p>
      <div className="mt-6">
        {hasAccess && p.contentUrl ? (
          <a href={p.contentUrl} className="btn-gold" target="_blank" rel="noopener noreferrer">{p.kind === "VIDEO" ? "Watch now" : "Read now"}</a>
        ) : hasAccess ? (
          <p className="text-muted">You have access. The download link will appear here as soon as it's published.</p>
        ) : p.priceCents === 0 ? (
          <Link href={`/signup?next=${encodeURIComponent(`/products/${p.slug}`)}`} className="btn-gold">Create a free account to get it</Link>
        ) : p.priceCents == null ? (
          <Link href={`/contact?topic=${encodeURIComponent("Quote: " + p.name)}`} className="btn-gold">Request a quote</Link>
        ) : p.kind === "PACKAGE" ? (
          <BuyNowPackage productId={p.id} slug={p.slug} allowInstallments={p.allowInstallments} totalLabel={formatCents(p.priceCents)} installmentLabels={installmentLabels} />
        ) : (
          <AddToCartButton productId={p.id} name={p.name} priceCents={p.priceCents} />
        )}
      </div>
    </div>
  );
}
