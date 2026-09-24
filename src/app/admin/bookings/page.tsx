import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { bookings, services } from "@/db/schema";
import { setBookingStatus } from "@/lib/actions/admin";
import { formatSlot } from "@/lib/schedule";

export default async function BookingsAdmin() {
  const rows = await db.select({ b: bookings, service: services.title }).from(bookings)
    .leftJoin(services, eq(services.id, bookings.serviceId)).orderBy(desc(bookings.startsAt)).limit(200);
  return (
    <div>
      <h1 className="section-title">Bookings</h1>
      <div className="card mt-6 overflow-x-auto !p-0">
        <table className="admin-table">
          <thead><tr><th>When (Eastern)</th><th>Client</th><th>Service</th><th>Inquiry</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(({ b, service }) => (
              <tr key={b.id}>
                <td className="whitespace-nowrap">{formatSlot(b.startsAt)}</td>
                <td>{b.name}<br /><a className="underline" href={`mailto:${b.email}`}>{b.email}</a><br />{b.phone}<br /><span className="text-xs text-muted">{b.address}</span></td>
                <td>{service ?? "—"}</td>
                <td className="max-w-xs whitespace-pre-wrap text-xs">{b.inquiry}</td>
                <td>
                  <form action={setBookingStatus} className="flex items-center gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    <select name="status" defaultValue={b.status} className="field !w-auto !py-1" aria-label="Booking status">
                      <option value="REQUESTED">Requested</option><option value="CONFIRMED">Confirmed</option><option value="CANCELLED">Cancelled</option>
                    </select>
                    <button className="btn-navy !px-3 !py-1">Save</button>
                  </form>
                  {b.calendarEventId && <p className="mt-1 text-xs text-muted">On calendar</p>}
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="text-muted">No bookings yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
