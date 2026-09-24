import Link from "next/link";
import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { integrations } from "@/lib/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const LINKS = [
  ["/admin", "Dashboard"], ["/admin/bookings", "Bookings"], ["/admin/messages", "Messages"], ["/admin/orders", "Orders"],
  ["/admin/users", "Members"], ["/admin/services", "Services"], ["/admin/products", "Products"], ["/admin/plans", "Subscription plans"],
  ["/admin/team", "Team"], ["/admin/content", "Page text"],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  const missing = [
    !integrations.stripe() && "payments (Stripe)",
    !integrations.calendar() && "business calendar (Google)",
    !integrations.email() && "email notifications (Resend)",
  ].filter(Boolean);
  return (
    <div className="container-page grid gap-8 py-10 md:grid-cols-[200px_1fr]">
      <nav aria-label="Admin" className="space-y-1 text-sm font-bold">
        {LINKS.map(([href, label]) => (
          <Link key={href} href={href} className="block rounded-md px-3 py-2 text-navy-900 hover:bg-white">{label}</Link>
        ))}
      </nav>
      <div className="min-w-0">
        {missing.length > 0 && (
          <p className="mb-6 rounded-md border border-gold-400 bg-gold-300/20 px-4 py-3 text-sm">
            Not connected yet: {missing.join(", ")}. See SETUP.md in the repository.
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
