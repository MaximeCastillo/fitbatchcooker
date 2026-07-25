import { defineConfig, devices } from "@playwright/test";

// Basic E2E smoke config. Runs against the local dev server (reused if already up,
// else started). Point at another origin with E2E_BASE_URL (e.g. a Vercel preview).
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  globalTeardown: "./e2e/global-teardown.ts",
  fullyParallel: false, // the smoke flows sign up / clean up shared DB rows — keep serial
  workers: 1,
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL,
    locale: "en-US",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
