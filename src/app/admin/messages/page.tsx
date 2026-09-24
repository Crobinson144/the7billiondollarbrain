import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { markMessageHandled } from "@/lib/actions/admin";

export default async function MessagesAdmin() {
  const rows = await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)).limit(200);
  return (
    <div>
      <h1 className="section-title">Messages</h1>
      <ul className="mt-6 space-y-3">
        {rows.map((m) => (
          <li key={m.id} className={`card ${m.handled ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-bold">{m.name} · <a className="underline" href={`mailto:${m.email}`}>{m.email}</a>{m.phone && ` · ${m.phone}`}</p>
                <p className="text-xs text-muted">{m.createdAt.toLocaleString("en-US", { timeZone: "America/New_York" })}</p>
              </div>
              <form action={markMessageHandled}>
                <input type="hidden" name="id" value={m.id} />
                <input type="hidden" name="handled" value={m.handled ? "false" : "true"} />
                <button className="btn-outline !px-3 !py-1">{m.handled ? "Mark unhandled" : "Mark handled"}</button>
              </form>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{m.message}</p>
          </li>
        ))}
        {rows.length === 0 && <li className="text-muted">No messages yet.</li>}
      </ul>
    </div>
  );
}
