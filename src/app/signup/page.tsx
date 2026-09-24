import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { signup } from "@/lib/actions/auth";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create an account" };

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="section-title mb-2 text-center">Create your account</h1>
      <p className="mb-6 text-center text-sm text-muted">Basic membership is free. Premium comes with any subscription.</p>
      <AuthForm mode="signup" action={signup} next={next} />
    </div>
  );
}
