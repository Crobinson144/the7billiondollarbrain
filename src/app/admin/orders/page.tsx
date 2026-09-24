import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { formatCents } from "@/lib/money";

export default async function OrdersAdmin() {
  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(200);
  const items = rows.length ? await db.select().from(orderItems) : [];
  const byOrder = new Map<string, typeof items>();
  for (const i of items) byOrder.set(i.orderId, [...(byOrder.get(i.orderId) ?? []), i]);
  return (
    <div>
      <h1 className="section-title">Orders</h1>
      <div className="card mt-6 overflow-x-auto !p-0">
        <table className="admin-table">
          <thead><tr><th>Date</th><th>Customer</th><th>Items</th><th>Total</th><th>Payments</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td className="whitespace-nowrap">{o.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })}</td>
                <td>{o.email}</td>
                <td>{(byOrder.get(o.id) ?? []).map((i) => `${i.name}${i.quantity > 1 ? ` ×${i.quantity}` : ""}`).join(", ")}</td>
                <td>{formatCents(o.totalCents)}</td>
                <td>{o.installments}</td>
                <td>{o.status}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={6} className="text-muted">No orders yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
