import Link from "next/link";
import type { Metadata } from "next";
import { ClearCart } from "./ClearCart";

export const metadata: Metadata = { title: "Thank you" };

export default function CheckoutSuccess() {
  return (
    <div className="container-page max-w-2xl py-20 text-center">
      <ClearCart />
      <h1 className="section-title">Thank you for your order</h1>
      <p className="mt-4 text-muted">Your payment was received. A receipt is on its way to your email, and your purchases and subscriptions appear in your account.</p>
      <Link href="/account" className="btn-gold mt-8">Go to my account</Link>
    </div>
  );
}
