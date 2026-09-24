import { notFound } from "next/navigation";
import { isResourceKey, RESOURCES } from "@/lib/admin/resources";
import { saveResource } from "@/lib/actions/admin";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function NewResource({ params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  if (!isResourceKey(resource)) notFound();
  const config = RESOURCES[resource];
  return (
    <div>
      <h1 className="section-title mb-6">Add {config.singular}</h1>
      <ResourceForm fields={config.fields} initial={{ published: true, sortOrder: 0 }} action={saveResource.bind(null, resource, null)} submitLabel="Create" />
    </div>
  );
}
