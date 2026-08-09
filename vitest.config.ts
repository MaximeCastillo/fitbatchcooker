import { fileURLToPath } from "node:url";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
  test: {
    exclude: [
      ...configDefaults.exclude,
      // Playwright specs are run by `npm run e2e`. Without this they get picked
      // up as vitest files and fail on `test()` being called outside a
      // Playwright runner.
      "**/e2e/**",
      // Worktrees live inside the repo, so a run from the main checkout would
      // otherwise collect every test twice — once per checkout.
      ".claude/worktrees/**",
    ],
  },
  resolve: {
    // Mirror the `@/*` alias from tsconfig.json so tests import like app code.
    alias: {
      "@": fileURLToPath(new URL("./", import.meta.url)),
    },
  },
});
