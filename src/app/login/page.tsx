import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/AuthForm";
import { login } from "@/lib/actions/auth";
import { getCurrentUser, safeNextPath } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safeNextPath((await searchParams).next);
  if (await getCurrentUser()) redirect(next);
  return (
    <div className="container-page max-w-md py-16">
      <h1 className="section-title mb-6 text-center">Log in</h1>
      <AuthForm mode="login" action={login} next={next} />
    </div>
  );
}
