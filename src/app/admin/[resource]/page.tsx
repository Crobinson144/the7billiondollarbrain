import Link from "next/link";
import { notFound } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { isResourceKey, RESOURCES } from "@/lib/admin/resources";
import { formatCents } from "@/lib/money";

function display(col: string, v: unknown) {
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (col.endsWith("Cents")) return v == null ? "Quote" : formatCents(Number(v));
  return v == null || v === "" ? "—" : String(v);
}

export default async function ResourceList({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  const config = RESOURCES[resource];
  const table = config.table as typeof RESOURCES.services.table;
  const rows = (await db.select().from(table).orderBy(asc(table.sortOrder))) as unknown as Record<string, unknown>[];
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title">{config.plural}</h1>
        <Link href={`/admin/${resource}/new`} className="btn-gold">Add {config.singular}</Link>
      </div>
      <div className="card mt-6 overflow-x-auto !p-0">
        <table className="admin-table">
          <thead><tr>{config.listColumns.map((c) => <th key={c}>{config.fields.find((f) => f.name === c)?.label ?? c}</th>)}<th /></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={String(r.id)}>
                {config.listColumns.map((c) => <td key={c}>{display(c, r[c])}</td>)}
                <td className="text-right"><Link href={`/admin/${resource}/${r.id}`} className="font-bold underline">Edit</Link></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={config.listColumns.length + 1} className="text-muted">Nothing here yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
