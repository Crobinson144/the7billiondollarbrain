import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { plans, products, services, teamMembers } from "@/db/schema";

export const publishedServices = () =>
  db.select().from(services).where(eq(services.published, true)).orderBy(asc(services.sortOrder), asc(services.title));

export const publishedProducts = () =>
  db.select().from(products).where(eq(products.published, true)).orderBy(asc(products.sortOrder), asc(products.name));

export const publishedPlans = () =>
  db.select().from(plans).where(eq(plans.published, true)).orderBy(asc(plans.sortOrder));

export const publishedTeam = () =>
  db.select().from(teamMembers).where(eq(teamMembers.published, true)).orderBy(asc(teamMembers.sortOrder));

export async function productBySlug(slug: string) {
  const [p] = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.published, true))).limit(1);
  return p ?? null;
}
