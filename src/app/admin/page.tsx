import Link from "next/link";
import { and, count, eq, gte, sum } from "drizzle-orm";
import { db } from "@/db";
import { bookings, contactMessages, orders, users } from "@/db/schema";
import { formatCents } from "@/lib/money";

export default async function AdminDashboard() {
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 86_400_000);
  const [[upcoming], [unread], [sales], [members]] = await Promise.all([
    db.select({ n: count() }).from(bookings).where(and(gte(bookings.startsAt, now), eq(bookings.status, "CONFIRMED"))),
    db.select({ n: count() }).from(contactMessages).where(eq(contactMessages.handled, false)),
    db.select({ total: sum(orders.totalCents), n: count() }).from(orders).where(and(eq(orders.status, "PAID"), gte(orders.createdAt, monthAgo))),
    db.select({ n: count() }).from(users),
  ]);
  const cards = [
    { label: "Upcoming confirmed sessions", value: String(upcoming.n), href: "/admin/bookings" },
    { label: "Unhandled messages", value: String(unread.n), href: "/admin/messages" },
    { label: "Paid orders, last 30 days", value: `${sales.n} · ${formatCents(Number(sales.total ?? 0))}`, href: "/admin/orders" },
    { label: "Member accounts", value: String(members.n), href: "/admin/users" },
  ];
  return (
    <div>
      <h1 className="section-title">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="card hover:border-gold-400">
            <p className="text-sm text-muted">{c.label}</p>
            <p className="mt-1 text-3xl font-bold text-navy-900">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
