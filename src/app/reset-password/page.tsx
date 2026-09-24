import Link from "next/link";
import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/AccountForms";
import { resetPassword } from "@/lib/actions/auth";
import { tokenIsValid } from "@/lib/auth-tokens";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Choose a new password", robots: { index: false }, referrer: "no-referrer" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  const valid = await tokenIsValid(token, "RESET_PASSWORD");
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="section-title mb-6 text-center">Choose a new password</h1>
      {valid ? <ResetPasswordForm token={token} action={resetPassword} /> : (
        <div className="card space-y-3 text-center">
          <p>This reset link has expired or was already used.</p>
          <Link href="/forgot-password" className="btn-gold">Send a new link</Link>
        </div>
      )}
    </div>
  );
}
