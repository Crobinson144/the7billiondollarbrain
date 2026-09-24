import type { Metadata } from "next";
import { getContent } from "@/lib/content";
import { publishedPlans } from "@/lib/queries/catalog";
import { formatCents } from "@/lib/money";
import { SubscribeButton } from "@/components/BuyButtons";
import { autoRenewalDisclosure, fixedTermDisclosure } from "@/lib/legal";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Subscriptions" };

export default async function SubscriptionsPage() {
  const [copy, plans] = await Promise.all([getContent(["subscriptions.intro"]), publishedPlans()]);
  return (
    <div className="container-page py-14">
      <p className="eyebrow">Subscriptions</p>
      <h1 className="section-title mt-2">Monthly plans</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{copy["subscriptions.intro"]}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <article key={p.id} id={p.slug} className="card flex scroll-mt-24 flex-col">
            <h2 className="text-xl text-navy-900">{p.name}</h2>
            <p className="mt-2 flex-1 text-sm text-muted">{p.description}</p>
            <p className="mt-4 text-3xl font-bold text-navy-900">{formatCents(p.monthlyPriceCents)}<span className="text-base font-normal text-muted">/month</span></p>
            <p className="mb-4 text-xs font-bold text-muted">{p.termMonths ? `${p.termMonths}-month plan` : "Cancel anytime"}{p.grantsPremium ? " · Includes premium membership" : ""}</p>
            <SubscribeButton
              planId={p.id}
              autoRenews={!p.termMonths}
              disclosure={p.termMonths ? fixedTermDisclosure(formatCents(p.monthlyPriceCents), p.termMonths) : autoRenewalDisclosure(formatCents(p.monthlyPriceCents))}
            />
          </article>
        ))}
      </div>
    </div>
  );
}
