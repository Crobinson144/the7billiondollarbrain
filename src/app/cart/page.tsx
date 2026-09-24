import type { Metadata } from "next";
import { CartView } from "./CartView";

export const metadata: Metadata = { title: "Cart" };

export default function CartPage() {
  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="section-title">Your cart</h1>
      <CartView />
    </div>
  );
}
