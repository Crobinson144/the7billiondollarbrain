import Link from "next/link";
import type { Metadata } from "next";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { consumeToken } from "@/lib/auth-tokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Confirm your email", robots: { index: false }, referrer: "no-referrer" };

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const userId = await consumeToken((await searchParams).token ?? "", "VERIFY_EMAIL");
  if (userId) await db.update(users).set({ emailVerifiedAt: new Date() }).where(and(eq(users.id, userId), isNull(users.emailVerifiedAt)));
  return (
    <div className="container-page max-w-md py-16 text-center">
      <h1 className="section-title mb-4">{userId ? "Email confirmed" : "Link not valid"}</h1>
      <p className="text-muted">
        {userId
          ? "Thanks. Your email address is confirmed and checkout is unlocked."
          : "This confirmation link has expired or was already used. Log in and send yourself a new one from My account."}
      </p>
      <Link href="/account" className="btn-gold mt-6">Go to my account</Link>
    </div>
  );
}
