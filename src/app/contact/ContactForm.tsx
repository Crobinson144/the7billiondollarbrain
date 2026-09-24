"use client";

import { useActionState } from "react";
import { sendContact, type ContactState } from "@/lib/actions/contact";

export function ContactForm({ topic }: { topic: string }) {
  const [state, action, pending] = useActionState(sendContact, { ok: false, message: "" } as ContactState);
  const err = state.errors ?? {};
  if (state.ok) return <p role="status" className="card mt-8">{state.message}</p>;
  return (
    <form action={action} className="card mt-8 space-y-4">
      <h2 className="text-xl text-navy-900">Send a message</h2>
      {state.message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        <div><label htmlFor="c-name" className="label">Name</label><input id="c-name" name="name" className="field" required autoComplete="name" />{err.name && <p className="mt-1 text-sm text-red-700">{err.name}</p>}</div>
        <div><label htmlFor="c-email" className="label">Email</label><input id="c-email" name="email" type="email" className="field" required autoComplete="email" />{err.email && <p className="mt-1 text-sm text-red-700">{err.email}</p>}</div>
        <div><label htmlFor="c-phone" className="label">Phone (optional)</label><input id="c-phone" name="phone" type="tel" className="field" autoComplete="tel" /></div>
      </div>
      <div>
        <label htmlFor="c-message" className="label">Message</label>
        <textarea id="c-message" name="message" rows={5} className="field" required defaultValue={topic ? `${topic}\n\n` : ""} />
        {err.message && <p className="mt-1 text-sm text-red-700">{err.message}</p>}
      </div>
      <div className="hidden" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button className="btn-gold" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}
