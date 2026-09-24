"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";

function Notice({ state }: { state: AuthState }) {
  if (!state.message) return null;
  return (
    <p role={state.ok ? "status" : "alert"} className={`rounded-md px-3 py-2 text-sm ${state.ok ? "bg-green-50 text-green-900" : "bg-red-50 text-red-800"}`}>
      {state.message}
    </p>
  );
}

export function ForgotPasswordForm({ action }: { action: (prev: AuthState, form: FormData) => Promise<AuthState> }) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="card space-y-4">
      <Notice state={state} />
      <div>
        <label htmlFor="email" className="label">Email on your account</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="field" />
      </div>
      <button className="btn-gold w-full" disabled={pending}>{pending ? "Please wait…" : "Email me a reset link"}</button>
      <p className="text-center text-sm text-muted"><Link href="/login" className="font-bold text-navy-900 underline">Back to log in</Link></p>
    </form>
  );
}

export function ResetPasswordForm({ token, action }: { token: string; action: (prev: AuthState, form: FormData) => Promise<AuthState> }) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="card space-y-4">
      <Notice state={state} />
      <input type="hidden" name="token" value={token} />
      <div>
        <label htmlFor="password" className="label">New password</label>
        <input id="password" name="password" type="password" required minLength={10} autoComplete="new-password" className="field" aria-invalid={Boolean(err.password)} />
        {err.password && <p className="mt-1 text-sm text-red-700">{err.password}</p>}
      </div>
      <div>
        <label htmlFor="confirm" className="label">Type it again</label>
        <input id="confirm" name="confirm" type="password" required minLength={10} autoComplete="new-password" className="field" aria-invalid={Boolean(err.confirm)} />
        {err.confirm && <p className="mt-1 text-sm text-red-700">{err.confirm}</p>}
      </div>
      <button className="btn-gold w-full" disabled={pending}>{pending ? "Please wait…" : "Save new password"}</button>
    </form>
  );
}

export function ResendVerification({ email, action }: { email: string; action: (prev: AuthState) => Promise<AuthState> }) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  return (
    <form action={formAction} className="mt-6 rounded-lg border border-gold-500 bg-gold-300/20 p-4 text-sm">
      <p><strong>Please confirm your email.</strong> We sent a link to {email}. You'll need to confirm it before checking out.</p>
      <button className="btn-outline mt-3 !px-3 !py-1.5" disabled={pending}>{pending ? "Sending…" : "Send a new link"}</button>
      {state.message && <p role="status" className="mt-2">{state.message}</p>}
    </form>
  );
}
