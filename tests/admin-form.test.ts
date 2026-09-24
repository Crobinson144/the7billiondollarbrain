import { describe, expect, it } from "vitest";
import { parseResourceForm, RESOURCES } from "@/lib/admin/resources";

const fd = (o: Record<string, string>) => { const f = new FormData(); for (const [k, v] of Object.entries(o)) f.set(k, v); return f; };

describe("parseResourceForm", () => {
  it("converts dollars to cents and checkboxes to booleans", () => {
    const r = parseResourceForm(RESOURCES.products.fields, fd({
      name: "Logo", slug: "business-logo", kind: "ADDON", priceCents: "$1,250.50", published: "on",
    }));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.values.priceCents).toBe(125050);
      expect(r.values.published).toBe(true);
      expect(r.values.allowInstallments).toBe(false);
    }
  });
  it("leaves quote-only prices empty", () => {
    const r = parseResourceForm(RESOURCES.products.fields, fd({ name: "Trademark", slug: "trademark", kind: "QUOTE", priceCents: "" }));
    expect(r.ok && r.values.priceCents).toBe(null);
  });
  it("rejects bad slugs, kinds and prices", () => {
    const r = parseResourceForm(RESOURCES.products.fields, fd({ name: "X", slug: "Bad Slug", kind: "CAR", priceCents: "abc" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(Object.keys(r.errors).sort()).toEqual(["kind", "priceCents", "slug"]);
  });
  it("requires a monthly price on plans and allows an open-ended term", () => {
    const r = parseResourceForm(RESOURCES.plans.fields, fd({ name: "Pass", slug: "pass", monthlyPriceCents: "21.99", termMonths: "" }));
    expect(r.ok && r.values.monthlyPriceCents).toBe(2199);
    expect(r.ok && r.values.termMonths).toBe(null);
    const bad = parseResourceForm(RESOURCES.plans.fields, fd({ name: "Pass", slug: "pass", monthlyPriceCents: "" }));
    expect(bad.ok).toBe(false);
  });
});
