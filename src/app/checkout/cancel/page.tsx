import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Checkout cancelled" };

export default function CheckoutCancel() {
  return (
    <div className="container-page max-w-2xl py-20 text-center">
      <h1 className="section-title">Checkout cancelled</h1>
      <p className="mt-4 text-muted">No payment was taken. Your cart is still saved.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/cart" className="btn-gold">Back to cart</Link>
        <Link href="/contact" className="btn-outline">Questions? Contact us</Link>
      </div>
    </div>
  );
}
