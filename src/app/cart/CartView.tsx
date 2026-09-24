"use client";

import Link from "next/link";
import { useState } from "react";
import { startCheckout, useCart } from "@/components/cart";
import { formatCents } from "@/lib/money";

export function CartView() {
  const { items, setQuantity, remove } = useCart();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (items.length === 0) return <p className="mt-6 text-muted">Your cart is empty. <Link href="/products" className="font-bold underline">Browse products</Link>.</p>;
  const total = items.reduce((s, i) => s + i.priceCents * i.quantity, 0);
  return (
    <div className="card mt-6">
      <ul className="divide-y divide-line">
        {items.map((i) => (
          <li key={i.productId} className="flex flex-wrap items-center justify-between gap-3 py-3">
            <span className="font-bold">{i.name}</span>
            <span className="flex items-center gap-3">
              <label className="sr-only" htmlFor={`q-${i.productId}`}>Quantity</label>
              <input id={`q-${i.productId}`} type="number" min={1} max={10} value={i.quantity} onChange={(e) => setQuantity(i.productId, Number(e.target.value))} className="field w-20" />
              <span className="w-24 text-right">{formatCents(i.priceCents * i.quantity)}</span>
              <button type="button" className="text-sm text-red-700 underline" onClick={() => remove(i.productId)}>Remove</button>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-right text-xl font-bold">Total: {formatCents(total)}</p>
      <p className="mt-1 text-right text-xs text-muted">Prices are confirmed at checkout.</p>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      <div className="mt-5 text-right">
        <button type="button" className="btn-gold" disabled={busy} onClick={async () => {
          setBusy(true); setError("");
          const msg = await startCheckout("/api/checkout", { lines: items.map((i) => ({ productId: i.productId, quantity: i.quantity })), installments: 1 }, "/cart");
          if (msg) { setError(msg); setBusy(false); }
        }}>{busy ? "Redirecting…" : "Check out"}</button>
      </div>
    </div>
  );
}
