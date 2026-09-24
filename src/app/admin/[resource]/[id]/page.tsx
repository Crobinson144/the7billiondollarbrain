import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { isResourceKey, RESOURCES } from "@/lib/admin/resources";
import { deleteResource, saveResource } from "@/lib/actions/admin";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function EditResource({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  if (!isResourceKey(resource)) notFound();
  const config = RESOURCES[resource];
  const table = config.table as typeof RESOURCES.services.table;
  const [row] = (await db.select().from(table).where(eq(table.id, id)).limit(1)) as unknown as Record<string, unknown>[];
  if (!row) notFound();
  return (
    <div>
      <h1 className="section-title mb-6">Edit {config.singular}</h1>
      <ResourceForm fields={config.fields} initial={row} action={saveResource.bind(null, resource, id)} submitLabel="Save changes" />
      <form action={deleteResource.bind(null, resource, id)} className="mt-6">
        <button className="btn border border-red-700 text-red-700 hover:bg-red-700 hover:text-white">Delete {config.singular}</button>
        {resource === "plans" && <p className="mt-2 text-xs text-muted">Plans that have subscribers are unpublished instead of deleted.</p>}
      </form>
    </div>
  );
}
