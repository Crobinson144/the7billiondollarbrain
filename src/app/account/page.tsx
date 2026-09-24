import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, orders, plans, subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { logout, resendVerification } from "@/lib/actions/auth";
import { ResendVerification } from "@/components/AccountForms";
import { integrations } from "@/lib/env";
import { formatCents } from "@/lib/money";
import { formatSlot } from "@/lib/schedule";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const user = await requireUser("/account");
  const { reset } = await searchParams;
  const [myOrders, mySubs, myBookings] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(50),
    db.select({ sub: subscriptions, plan: plans }).from(subscriptions).innerJoin(plans, eq(plans.id, subscriptions.planId))
      .where(eq(subscriptions.userId, user.id)).orderBy(desc(subscriptions.createdAt)),
    db.select().from(bookings).where(eq(bookings.userId, user.id)).orderBy(desc(bookings.startsAt)).limit(50),
  ]);

  return (
    <div className="container-page py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">My account</p>
          <h1 className="section-title mt-1">Welcome, {user.name.split(" ")[0]}</h1>
          <p className="mt-2 text-muted">
            Membership: <strong className={user.tier === "PREMIUM" ? "text-gold-500" : ""}>{user.tier === "PREMIUM" ? "Premium" : "Basic"}</strong>
            {user.tier === "BASIC" && <> · <Link href="/subscriptions" className="font-bold underline">Upgrade with any subscription</Link></>}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/members/library" className="btn-navy">Members library</Link>
          <form action="/api/billing-portal" method="post"><button className="btn-outline">Manage billing</button></form>
          <form action={logout}><button className="btn text-muted hover:text-navy-900">Log out</button></form>
        </div>
      </div>

      {reset && <p role="status" className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-900">Your password was changed. Any other devices were signed out.</p>}
      {integrations.email() && !user.emailVerifiedAt && <ResendVerification email={user.email} action={resendVerification} />}

      <section className="mt-10">
        <h2 className="text-2xl text-navy-900">Subscriptions</h2>
        {mySubs.length === 0 ? <p className="mt-2 text-muted">No subscriptions yet.</p> : (
          <ul className="mt-3 space-y-2">
            {mySubs.map(({ sub, plan }) => (
              <li key={sub.id} className="card !p-4">
                <strong>{plan.name}</strong> · {formatCents(plan.monthlyPriceCents)}/month · <span className="capitalize">{sub.status.replace("_", " ")}</span>
                {sub.cancelAt && <span className="text-sm text-muted"> · ends {sub.cancelAt.toLocaleDateString("en-US")}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl text-navy-900">Orders</h2>
        {myOrders.length === 0 ? <p className="mt-2 text-muted">No orders yet.</p> : (
          <ul className="mt-3 space-y-2">
            {myOrders.map((o) => (
              <li key={o.id} className="card !p-4">
                {o.createdAt.toLocaleDateString("en-US")} · {formatCents(o.totalCents)}
                {o.installments > 1 && ` in ${o.installments} payments`} · <span className="capitalize">{o.status.toLowerCase()}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-2xl text-navy-900">Sessions</h2>
        {myBookings.length === 0 ? <p className="mt-2 text-muted">No sessions booked. <Link href="/services/schedule" className="font-bold underline">Schedule one</Link>.</p> : (
          <ul className="mt-3 space-y-2">
            {myBookings.map((b) => (
              <li key={b.id} className="card !p-4">{formatSlot(b.startsAt)} · <span className="capitalize">{b.status.toLowerCase()}</span></li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
