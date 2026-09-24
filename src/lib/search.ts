import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

export type SearchHit = { type: "Service" | "Product" | "Plan" | "Page"; title: string; snippet: string; href: string; rank: number };

/** Full-text search across published services, products, plans and page copy. */
export async function searchSite(q: string): Promise<SearchHit[]> {
  const query = q.trim().slice(0, 100);
  if (query.length < 2) return [];
  const { rows } = await db.execute<SearchHit>(sql`
    with q as (select websearch_to_tsquery('english', ${query}) as tsq)
    select * from (
      select 'Service' as type, title, summary as snippet, '/services#' || slug as href,
             ts_rank(to_tsvector('english', title || ' ' || summary || ' ' || body), q.tsq) as rank
        from services, q where published and to_tsvector('english', title || ' ' || summary || ' ' || body) @@ q.tsq
      union all
      select 'Product', name, description, '/products/' || slug,
             ts_rank(to_tsvector('english', name || ' ' || description || ' ' || features), q.tsq)
        from products, q where published and not members_only
         and to_tsvector('english', name || ' ' || description || ' ' || features) @@ q.tsq
      union all
      select 'Plan', name, description, '/subscriptions#' || slug,
             ts_rank(to_tsvector('english', name || ' ' || description), q.tsq)
        from plans, q where published and to_tsvector('english', name || ' ' || description) @@ q.tsq
      union all
      select 'Page', label, left(body, 200),
             case when key like 'about.%' then '/about' when key like 'services.%' then '/services'
                  when key like 'products.%' then '/products' when key like 'subscriptions.%' then '/subscriptions'
                  when key like 'contact.%' then '/contact' else '/' end,
             ts_rank(to_tsvector('english', body), q.tsq)
        from content_blocks, q where key not like 'investments.%' and to_tsvector('english', body) @@ q.tsq
    ) hits order by rank desc limit 25`);
  return rows;
}
