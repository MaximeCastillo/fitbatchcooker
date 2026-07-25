import { execSync } from "node:child_process";

// Runs once after the whole suite: purge throwaway E2E accounts via a separate tsx
// process (the Prisma client is ESM and can't be imported in the Playwright runtime).
export default function globalTeardown() {
  try {
    execSync("npx tsx e2e/purge-test-users.ts", { stdio: "inherit" });
  } catch (error) {
    console.warn("[e2e] test-user purge failed (non-fatal):", error);
  }
}
