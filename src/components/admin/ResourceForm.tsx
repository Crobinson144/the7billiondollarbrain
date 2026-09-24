"use client";

import { useActionState } from "react";
import type { Field } from "@/lib/admin/resources";
import type { AdminFormState } from "@/lib/actions/admin";

export function ResourceForm({ fields, initial, action, submitLabel }: {
  fields: readonly Field[];
  initial: Record<string, unknown>;
  action: (prev: AdminFormState, form: FormData) => Promise<AdminFormState>;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });
  const err = state.errors ?? {};
  return (
    <form action={formAction} className="card space-y-4">
      {state.message && <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{state.message}</p>}
      {fields.map((f) => {
        const id = `f-${f.name}`;
        const value = initial[f.name];
        const hint = f.help && <p className="mt-1 text-xs text-muted">{f.help}</p>;
        const error = err[f.name] && <p className="mt-1 text-sm text-red-700">{err[f.name]}</p>;
        if (f.type === "boolean") {
          return (
            <label key={f.name} className="flex items-center gap-2 text-sm font-bold">
              <input type="checkbox" name={f.name} defaultChecked={Boolean(value)} /> {f.label}
            </label>
          );
        }
        return (
          <div key={f.name}>
            <label htmlFor={id} className="label">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea id={id} name={f.name} rows={f.name === "summary" ? 3 : 6} className="field" defaultValue={String(value ?? "")} />
            ) : f.type === "select" ? (
              <select id={id} name={f.name} className="field" defaultValue={String(value ?? "")}>
                <option value="">Choose…</option>
                {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <input
                id={id} name={f.name} className="field"
                inputMode={f.type === "number" || f.type === "money" ? "decimal" : undefined}
                defaultValue={f.type === "money" ? (value == null ? "" : (Number(value) / 100).toFixed(2)) : value == null ? "" : String(value)}
              />
            )}
            {hint}{error}
          </div>
        );
      })}
      <button className="btn-gold" disabled={pending}>{pending ? "Saving…" : submitLabel}</button>
    </form>
  );
}
