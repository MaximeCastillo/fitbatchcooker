import type { Page } from "@playwright/test";

// E2E tests need the app's dev env (Supabase + Postgres via .env). Throwaway accounts use
// the `e2e+` email prefix so they're easy to purge; recipes/batches they create are scoped
// to that user (invisible to anyone else) and deleted by the global teardown.
export const TEST_EMAIL_PREFIX = "e2e+";

// Sign up a fresh throwaway account and land authenticated. Signup grants a session
// (email confirmation is off), so we end up on an authed page.
export async function signUp(page: Page): Promise<string> {
  const email = `${TEST_EMAIL_PREFIX}${Date.now()}-${process.hrtime.bigint()}@example.com`;
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
