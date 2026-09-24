"use client";

import { useActionState, useEffect, useState } from "react";
import { createBooking, type BookingState } from "@/lib/actions/booking";

type Slot = { start: string; label: string };
const initial: BookingState = { ok: false, message: "" };

function todayEastern(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York" }).format(new Date());
}

export function BookingForm({ services, defaults }: {
  services: { id: string; title: string }[];
  defaults: { serviceId: string; name: string; email: string; phone: string };
}) {
  const [state, action, pending] = useActionState(createBooking, initial);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const err = state.errors ?? {};

  useEffect(() => {
    if (!date) return;
    let cancelled = false;
    setLoading(true);
    fetch(`/api/slots?date=${encodeURIComponent(date)}`)
      .then((r) => r.json())
      .then((d: { slots: Slot[] }) => { if (!cancelled) setSlots(d.slots); })
      .catch(() => { if (!cancelled) setSlots([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [date, state]);

  if (state.ok) {
    return <div role="status" className="card mt-8 border-gold-400 bg-white"><h2 className="text-2xl text-navy-900">You&apos;re booked</h2><p className="mt-2">{state.message}</p></div>;
  }

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input id={name} name={name} className="field" aria-invalid={Boolean(err[name])} aria-describedby={err[name] ? `${name}-err` : undefined} {...props} />
      {err[name] && <p id={`${name}-err`} className="mt-1 text-sm text-red-700">{err[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="card mt-8 space-y-5" noValidate>
      {state.message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>}
      <div className="grid gap-5 sm:grid-cols-2">
        {field("name", "Name", { required: true, autoComplete: "name", defaultValue: defaults.name })}
        {field("phone", "Phone number", { required: true, type: "tel", autoComplete: "tel", defaultValue: defaults.phone })}
        {field("email", "Email", { required: true, type: "email", autoComplete: "email", defaultValue: defaults.email })}
        {field("address", "Address", { required: true, autoComplete: "street-address" })}
      </div>
      <div>
        <label htmlFor="serviceId" className="label">Service desired</label>
        <select id="serviceId" name="serviceId" className="field" defaultValue={defaults.serviceId} required>
          <option value="">Choose a service</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
        </select>
        {err.serviceId && <p className="mt-1 text-sm text-red-700">{err.serviceId}</p>}
      </div>
      <div>
        <label htmlFor="inquiry" className="label">Inquiry or question</label>
        <textarea id="inquiry" name="inquiry" rows={5} className="field" required />
        {err.inquiry && <p className="mt-1 text-sm text-red-700">{err.inquiry}</p>}
      </div>
      <fieldset>
        <legend className="label">Day and time (Eastern)</legend>
        <input type="date" aria-label="Session date" className="field max-w-xs" min={todayEastern()} value={date} onChange={(e) => { setDate(e.target.value); setSlots(null); }} />
        <div className="mt-3">
          {loading && <p className="text-sm text-muted">Checking availability…</p>}
          {!loading && date && slots && slots.length === 0 && <p className="text-sm text-muted">No open times that day. Sessions are Monday to Friday; please pick another date.</p>}
          {!loading && slots && slots.length > 0 && (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <label key={s.start} className="flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-2 text-sm has-[:checked]:border-gold-500 has-[:checked]:bg-gold-300/30">
                  <input type="radio" name="start" value={s.start} required />
                  {new Date(s.start).toLocaleTimeString("en-US", { timeZone: "America/New_York", hour: "numeric", minute: "2-digit" })}
                </label>
              ))}
            </div>
          )}
        </div>
        {err.start && <p className="mt-1 text-sm text-red-700">{err.start}</p>}
      </fieldset>
      <div className="hidden" aria-hidden="true"><label>Leave empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button type="submit" className="btn-gold" disabled={pending}>{pending ? "Booking…" : "Schedule session"}</button>
    </form>
  );
}
