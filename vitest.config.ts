import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: { include: ["tests/**/*.test.ts"], environment: "node", fileParallelism: false },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // "server-only" throws outside the React Server Components runtime; tests run server code directly.
      "server-only": path.resolve(__dirname, "tests/server-only-stub.ts"),
    },
  },
});
