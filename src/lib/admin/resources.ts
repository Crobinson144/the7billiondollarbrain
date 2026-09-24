import { plans, products, services, teamMembers } from "@/db/schema";

export type FieldType = "text" | "textarea" | "number" | "money" | "boolean" | "select" | "slug";
export type Field = {
  name: string; label: string; type: FieldType; required?: boolean; help?: string;
  options?: { value: string; label: string }[]; nullable?: boolean;
};
export type ResourceKey = "services" | "products" | "plans" | "team";

export const RESOURCES = {
  services: {
    table: services, singular: "service", plural: "Services", titleField: "title",
    listColumns: ["title", "published", "sortOrder"],
    fields: [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", required: true, help: "Lowercase letters, numbers and dashes." },
      { name: "summary", label: "Summary", type: "textarea", required: true },
      { name: "body", label: "More detail (optional)", type: "textarea" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  products: {
    table: products, singular: "product", plural: "Products", titleField: "name",
    listColumns: ["name", "kind", "priceCents", "published"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "kind", label: "Type", type: "select", required: true, options: [
        { value: "EBOOK", label: "eBook" }, { value: "VIDEO", label: "Video tutorial" }, { value: "PACKAGE", label: "Package" },
        { value: "ADDON", label: "Add-on" }, { value: "QUOTE", label: "Quote only" }] },
      { name: "description", label: "Description", type: "textarea" },
      { name: "features", label: "What's included (one per line)", type: "textarea" },
      { name: "priceCents", label: "Price (USD)", type: "money", nullable: true, help: "Leave blank for quote-only items." },
      { name: "priceNote", label: "Price note", type: "text", help: "e.g. Monthly subscription not included" },
      { name: "allowInstallments", label: "Allow 3, 6 or 9 monthly installments", type: "boolean" },
      { name: "contentUrl", label: "Content link (eBooks and videos)", type: "text", help: "Only shown to people who bought it or have premium access." },
      { name: "includedWithPremium", label: "Included with premium (Education Pass)", type: "boolean" },
      { name: "membersOnly", label: "Visible to premium members only", type: "boolean" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  plans: {
    table: plans, singular: "plan", plural: "Subscription plans", titleField: "name",
    listColumns: ["name", "monthlyPriceCents", "termMonths", "published"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "slug", label: "URL slug", type: "slug", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "monthlyPriceCents", label: "Monthly price (USD)", type: "money", required: true },
      { name: "termMonths", label: "Number of monthly payments", type: "number", nullable: true, help: "Leave blank for an open-ended monthly plan." },
      { name: "grantsPremium", label: "Grants premium membership", type: "boolean" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
  team: {
    table: teamMembers, singular: "team member", plural: "Team", titleField: "name",
    listColumns: ["name", "role", "published"],
    fields: [
      { name: "name", label: "Name", type: "text", required: true },
      { name: "role", label: "Role", type: "text", required: true },
      { name: "bio", label: "Bio", type: "textarea" },
      { name: "sortOrder", label: "Sort order", type: "number" },
      { name: "published", label: "Published", type: "boolean" },
    ],
  },
} as const satisfies Record<ResourceKey, { fields: readonly Field[]; [k: string]: unknown }>;

export function isResourceKey(k: string): k is ResourceKey {
  return k in RESOURCES;
}

export type ParseResult = { ok: true; values: Record<string, unknown> } | { ok: false; errors: Record<string, string> };

/** Converts submitted form data into typed column values, with validation. */
export function parseResourceForm(fields: readonly Field[], form: FormData): ParseResult {
  const values: Record<string, unknown> = {};
  const errors: Record<string, string> = {};
  for (const f of fields) {
    const raw = form.get(f.name);
    const str = typeof raw === "string" ? raw.trim() : "";
    switch (f.type) {
      case "boolean":
        values[f.name] = raw === "on";
        break;
      case "number": {
        if (str === "") { if (f.nullable) values[f.name] = null; else values[f.name] = 0; break; }
        const n = Number(str);
        if (!Number.isInteger(n) || n < 0) errors[f.name] = "Enter a whole number.";
        else values[f.name] = n;
        break;
      }
      case "money": {
        if (str === "") {
          if (f.nullable) values[f.name] = null; else errors[f.name] = "Enter a price.";
          break;
        }
        const n = Number(str.replace(/[$,\s]/g, ""));
        if (!Number.isFinite(n) || n < 0) errors[f.name] = "Enter a valid amount.";
        else values[f.name] = Math.round(n * 100);
        break;
      }
      case "slug":
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(str)) errors[f.name] = "Use lowercase letters, numbers and dashes.";
        else values[f.name] = str;
        break;
      case "select":
        if (!f.options?.some((o) => o.value === str)) errors[f.name] = "Choose an option.";
        else values[f.name] = str;
        break;
      default:
        if (f.required && !str) errors[f.name] = "Required.";
        else if (str.length > 20000) errors[f.name] = "Too long.";
        else values[f.name] = str;
    }
  }
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, values };
}
