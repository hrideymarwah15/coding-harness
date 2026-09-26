import { defineConfig } from "vitest/config";
import * as path from "node:path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node"
  },
  resolve: {
    alias: {
      "@forge/core": path.resolve(__dirname, "./packages/core/src/index.ts"),
      "@forge/model": path.resolve(__dirname, "./packages/model/src/index.ts"),
      "@forge/tools": path.resolve(__dirname, "./packages/tools/src/index.ts")
    }
  }
});
