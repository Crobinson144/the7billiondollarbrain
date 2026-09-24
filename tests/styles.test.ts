import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";

// Next.js swallows Tailwind compile errors and ships an empty stylesheet, so compile it here and fail loudly.
describe("global stylesheet", () => {
  it("compiles and includes the site's custom utilities", async () => {
    const file = path.resolve(__dirname, "../src/app/globals.css");
    const result = await postcss([tailwind({ base: path.resolve(__dirname, "..") })]).process(readFileSync(file, "utf8"), { from: file });
    expect(result.css.length).toBeGreaterThan(10_000);
    for (const cls of [".btn-gold", ".card", ".field", ".container-page", ".admin-table"]) expect(result.css).toContain(cls);
  }, 30_000);
});
