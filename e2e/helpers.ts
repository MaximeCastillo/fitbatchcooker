import type { Page } from "@playwright/test";
import { TEST_EMAIL_DOMAIN, TEST_EMAIL_PREFIX } from "../lib/test-accounts";

// E2E tests need the app's dev env (Supabase + Postgres via .env). Throwaway accounts are
// shaped by lib/test-accounts.ts so the global teardown recognizes them; recipes/batches
// they create are scoped to that user (invisible to anyone else) and go with them.

// Sign up a fresh throwaway account and land authenticated. Signup grants a session
// (email confirmation is off), so we end up on an authed page.
export async function signUp(page: Page): Promise<string> {
  const email = `${TEST_EMAIL_PREFIX}${Date.now()}-${process.hrtime.bigint()}${TEST_EMAIL_DOMAIN}`;
  await page.goto("/login?mode=signup");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("password1234");
  await page
    .getByRole("button", { name: /Create an account|Créer un compte/i })
    .first()
    .click();
  await page.waitForURL((u) => !u.pathname.endsWith("/login"), { timeout: 15_000 });
  return email;
}
