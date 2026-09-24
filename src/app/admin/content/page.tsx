import { db } from "@/db";
import { contentBlocks } from "@/db/schema";
import { CONTENT_DEFAULTS } from "@/lib/content-defaults";
import { saveContent } from "@/lib/actions/admin";

export default async function ContentAdmin() {
  const rows = await db.select().from(contentBlocks);
  const saved = new Map(rows.map((r) => [r.key, r.body]));
  return (
    <div>
      <h1 className="section-title">Page text</h1>
      <p className="mt-2 text-sm text-muted">Separate paragraphs with a blank line. Changes appear on the site immediately.</p>
      <div className="mt-6 space-y-6">
        {Object.entries(CONTENT_DEFAULTS).map(([key, def]) => (
          <form key={key} action={saveContent} className="card space-y-3">
            <input type="hidden" name="key" value={key} />
            <label htmlFor={`c-${key}`} className="label">{def.label}</label>
            <textarea id={`c-${key}`} name="body" rows={key === "about.body" ? 10 : 3} className="field" defaultValue={saved.get(key) ?? def.body} />
            <button className="btn-navy">Save</button>
          </form>
        ))}
      </div>
    </div>
  );
}
