"use client";

import { useState } from "react";
import Link from "next/link";
import { startCheckout, useCart } from "./cart";

/** The clickwrap agreement shown next to every pay button. */
export function TermsCheckbox({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label htmlFor={id} className="flex items-start gap-2 text-sm">
      <input id={id} type="checkbox" className="mt-1" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>I agree to the <Link href="/terms" target="_blank" className="font-bold underline">Terms of Service</Link> and <Link href="/refunds" target="_blank" className="font-bold underline">Refund Policy</Link>.</span>
    </label>
  );
}

export function AddToCartButton({ productId, name, priceCents }: { productId: string; name: string; priceCents: number }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  return (
    <div className="flex items-center gap-3">
      <button type="button" className="btn-navy" onClick={() => { add({ productId, name, priceCents }); setAdded(true); }}>Add to cart</button>
      {added && <Link href="/cart" className="text-sm font-bold text-navy-900 underline">View cart</Link>}
    </div>
  );
}

export function BuyNowPackage({ productId, slug, allowInstallments, totalLabel, installmentLabels }: {
  productId: string; slug: string; allowInstallments: boolean; totalLabel: string; installmentLabels: Record<number, string>;
}) {
  const [installments, setInstallments] = useState(1);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      {allowInstallments && (
        <fieldset>
          <legend className="label">How would you like to pay?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {[1, 3, 6, 9].map((n) => (
              <label key={n} className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm has-[:checked]:border-gold-500 has-[:checked]:bg-gold-300/30">
                <input type="radio" name={`inst-${productId}`} checked={installments === n} onChange={() => setInstallments(n)} />
                {n === 1 ? `Pay in full: ${totalLabel}` : `${n} monthly payments: ${installmentLabels[n]}`}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {installments > 1 && <p className="text-sm text-muted">{installments} monthly payments of {installmentLabels[installments]?.replace("/mo", "")}, starting today. Billing stops automatically after the last payment. No interest or fees.</p>}
      <TermsCheckbox id={`agree-${productId}`} checked={agree} onChange={setAgree} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" className="btn-gold" disabled={busy || !agree} onClick={async () => {
        setBusy(true); setError("");
        const msg = await startCheckout("/api/checkout", { lines: [{ productId, quantity: 1 }], installments, agreeTerms: true }, `/products/${slug}`);
        if (msg) { setError(msg); setBusy(false); }
      }}>{busy ? "Redirecting…" : "Buy now"}</button>
    </div>
  );
}

export function SubscribeButton({ planId, disclosure, autoRenews }: { planId: string; disclosure: string; autoRenews: boolean }) {
  const [agree, setAgree] = useState(false);
  const [agreeRenewal, setAgreeRenewal] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">{disclosure}</p>
      {autoRenews && (
        <label htmlFor={`renew-${planId}`} className="flex items-start gap-2 text-sm">
          <input id={`renew-${planId}`} type="checkbox" className="mt-1" checked={agreeRenewal} onChange={(e) => setAgreeRenewal(e.target.checked)} />
          <span>I understand this renews automatically every month until I cancel.</span>
        </label>
      )}
      <TermsCheckbox id={`agree-${planId}`} checked={agree} onChange={setAgree} />
      <button type="button" className="btn-gold w-full" disabled={busy || !agree || (autoRenews && !agreeRenewal)} onClick={async () => {
        setBusy(true); setError("");
        const msg = await startCheckout("/api/checkout/plan", { planId, agreeTerms: true, agreeRenewal: autoRenews ? true : undefined }, "/subscriptions");
        if (msg) { setError(msg); setBusy(false); }
      }}>{busy ? "Redirecting…" : "Subscribe"}</button>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
