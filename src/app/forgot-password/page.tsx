import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/AccountForms";
import { requestPasswordReset } from "@/lib/actions/auth";

export const metadata: Metadata = { title: "Forgot password", robots: { index: false } };

export default function ForgotPasswordPage() {
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="section-title mb-2 text-center">Forgot your password?</h1>
      <p className="mb-6 text-center text-sm text-muted">Enter the email you signed up with and we'll send you a link to choose a new one.</p>
      <ForgotPasswordForm action={requestPasswordReset} />
    </div>
  );
}
