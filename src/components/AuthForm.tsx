"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";

export function AuthForm({ mode, action, next }: {
  mode: "login" | "signup";
  action: (prev: AuthState, form: FormData) => Promise<AuthState>;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  const err = state.errors ?? {};
  const input = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={Boolean(err[name])} {...props} />
      {err[name] && <p className="mt-1 text-sm text-red-700">{err[name]}</p>}
    </div>
  );
  return (
    <form action={formAction} className="card space-y-4">
      {state.message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>}
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && input("name", "Full name", { required: true, autoComplete: "name" })}
      {input("email", "Email", { required: true, type: "email", autoComplete: "email" })}
      {mode === "signup" && input("phone", "Phone (optional)", { type: "tel", autoComplete: "tel" })}
      {input("password", "Password", { required: true, type: "password", autoComplete: mode === "login" ? "current-password" : "new-password", minLength: mode === "signup" ? 10 : undefined })}
      <button className="btn-gold w-full" disabled={pending}>{pending ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}</button>
      <p className="text-center text-sm text-muted">
        {mode === "login"
          ? <>New here? <Link className="font-bold text-navy-900 underline" href={`/signup?next=${encodeURIComponent(next)}`}>Create an account</Link></>
          : <>Already have an account? <Link className="font-bold text-navy-900 underline" href={`/login?next=${encodeURIComponent(next)}`}>Log in</Link></>}
      </p>
    </form>
  );
}
