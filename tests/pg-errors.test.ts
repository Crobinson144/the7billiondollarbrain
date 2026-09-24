import { describe, expect, it } from "vitest";
import { pgErrorCode } from "@/lib/pg-errors";

describe("pgErrorCode", () => {
  it("reads a direct pg error code", () => expect(pgErrorCode({ code: "23505" })).toBe("23505"));
  it("reads a code wrapped by Drizzle", () => expect(pgErrorCode({ message: "Failed query", cause: { code: "23503" } })).toBe("23503"));
  it("ignores non-Postgres codes", () => expect(pgErrorCode({ code: "ECONNREFUSED" })).toBeUndefined());
});
