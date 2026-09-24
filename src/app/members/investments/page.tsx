import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getContent } from "@/lib/content";
import { env } from "@/lib/env";
import { Paragraphs } from "@/components/Paragraphs";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Investment opportunities", robots: { index: false } };

/**
 * Members-only placeholder. The bidding, listing search and Business in a Box auction flows
 * are intentionally not built yet; this page is hidden unless INVESTMENTS_ENABLED=true.
 */
export default async function InvestmentsPage() {
  if (!env.investmentsEnabled) notFound();
  await requireUser("/members/investments");
  const copy = await getContent(["investments.notice"]);
  return (
    <div className="container-page max-w-3xl py-14">
      <p className="eyebrow">Members only</p>
      <h1 className="section-title mt-1">Investment opportunities</h1>
      <Paragraphs text={copy["investments.notice"]} className="mt-4 text-lg" />
    </div>
  );
}
