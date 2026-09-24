"use client";

import { useState } from "react";
import Link from "next/link";
import { startCheckout, useCart } from "./cart";

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
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" className="btn-gold" disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        const msg = await startCheckout("/api/checkout", { lines: [{ productId, quantity: 1 }], installments }, `/products/${slug}`);
        if (msg) { setError(msg); setBusy(false); }
      }}>{busy ? "Redirecting…" : "Buy now"}</button>
    </div>
  );
}

export function SubscribeButton({ planId }: { planId: string }) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <button type="button" className="btn-gold w-full" disabled={busy} onClick={async () => {
        setBusy(true); setError("");
        const msg = await startCheckout("/api/checkout/plan", { planId }, "/subscriptions");
        if (msg) { setError(msg); setBusy(false); }
      }}>{busy ? "Redirecting…" : "Subscribe"}</button>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
