import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  test: {
    environment: "edge-runtime",
    server: { deps: { inline: ["convex-test"] } },
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["convex/**/*.ts", "src/lib/**/*.ts"],
      exclude: ["convex/_generated/**"],
    },
  },
});
