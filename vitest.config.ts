import { fileURLToPath } from "node:url";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    // Playwright specs live in e2e/ and are run by `npm run e2e`. Without this
    // they get picked up as vitest files and fail on `test()` being called
    // outside a Playwright runner.
    exclude: [...configDefaults.exclude, "e2e/**"],
  },
  resolve: {
    // Mirror the `@/*` alias from tsconfig.json so tests import like app code.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
