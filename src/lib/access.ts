import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders, type Product } from "@/db/schema";
import type { CurrentUser } from "./auth";

/** Whether a user may open an ebook or video: admin, free item, premium with the item included, or purchased. */
export async function canAccessProduct(user: CurrentUser | null, product: Pick<Product, "id" | "includedWithPremium" | "priceCents">) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  // Free guides only need a (free) account.
  if (product.priceCents === 0) return true;
  if (user.tier === "PREMIUM" && product.includedWithPremium) return true;
  const rows = await db
    .select({ id: orderItems.id })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(eq(orders.userId, user.id), eq(orders.status, "PAID"), eq(orderItems.productId, product.id)))
    .limit(1);
  return rows.length > 0;
}
