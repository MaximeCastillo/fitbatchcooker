import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

// The onboarding path a brand-new account walks. It exists because activation depends on
// it: without a weight there is no protein target, so every gauge stays at 0 and the user
// can never see a day sealed green. Serial; throwaway accounts are purged by the teardown.
// Copy is FR/EN (Playwright runs in en-US), so names are matched with bilingual regexes.

test("a fresh signup lands on the welcome screen", async ({ page }) => {
  await signUp(page);

  await expect(page).toHaveURL(/\/welcome$/);
  await expect(
    page.getByRole("heading", { name: /Welcome|Bienvenue/i }),
  ).toBeVisible();
});

test("typing a weight derives and previews the protein goal", async ({ page }) => {
  await signUp(page);

  const goal = page.locator('input[name="proteinTargetG"]');
  // Nothing to show until a weight is entered.
  await expect(goal).toHaveValue("");

  await page.locator('input[name="weightKg"]').fill("78");
  // 2 g/kg, derived live and mirrored into the (disabled) goal field.
  await expect(goal).toHaveValue("156");
  await expect(page.getByText("156 g")).toBeVisible();
});

test("completing the welcome screen stores the goal and opens the batch list", async ({
  page,
}) => {
  await signUp(page);

  await page.locator('input[name="firstName"]').fill("Maxime");
  await page.locator('input[name="weightKg"]').fill("78");
  await page.getByRole("button", { name: /Let's go|C'est parti/i }).click();

  await page.waitForURL(/\/batch/, { timeout: 10_000 });

  // The goal survived the write: the account page shows it back.
  await page.goto("/account");
  await expect(page.locator('input[name="weightKg"]')).toHaveValue("78");
  await expect(page.locator('input[name="proteinTargetG"]')).toHaveValue("156");
});

test("skipping the welcome screen still guides from the empty batch list", async ({
  page,
}) => {
  await signUp(page);

  await page.getByRole("link", { name: /I'll do it later|plus tard/i }).click();
  await page.waitForURL(/\/batch/, { timeout: 10_000 });

  // Skipping is not a dead end: the empty state carries both the CTA and the goal nudge.
  await expect(
    page.getByRole("heading", { name: /Nothing to cook|Rien à cuisiner/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Set my goal|Régler ma cible/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /New batch|Nouveau batch/i }),
  ).toHaveCount(2);
});
