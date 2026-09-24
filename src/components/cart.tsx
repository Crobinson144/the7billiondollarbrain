"use client";

import { useCallback, useEffect, useState } from "react";

export type CartItem = { productId: string; name: string; priceCents: number; quantity: number };
const KEY = "bdb_cart_v1";
const EVENT = "bdb-cart-change";

function read(): CartItem[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const items = raw ? (JSON.parse(raw) as CartItem[]) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  try { window.localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* storage unavailable */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const sync = () => setItems(read());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);
  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    const current = read();
    const existing = current.find((i) => i.productId === item.productId);
    write(existing ? current.map((i) => i.productId === item.productId ? { ...i, quantity: Math.min(i.quantity + 1, 10) } : i) : [...current, { ...item, quantity: 1 }]);
  }, []);
  const setQuantity = useCallback((productId: string, quantity: number) => {
    write(read().map((i) => i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(10, quantity)) } : i));
  }, []);
  const remove = useCallback((productId: string) => write(read().filter((i) => i.productId !== productId)), []);
  const clear = useCallback(() => write([]), []);
  return { items, add, setQuantity, remove, clear };
}

/** POSTs to a checkout endpoint and sends the browser to Stripe; returns an error message on failure. */
export async function startCheckout(endpoint: string, body: unknown, loginNext: string): Promise<string | null> {
  const res = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (res.status === 401) { window.location.href = `/login?next=${encodeURIComponent(loginNext)}`; return null; }
  const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
  if (data.url) { window.location.href = data.url; return null; }
  return data.error ?? "Checkout failed. Please try again.";
}
