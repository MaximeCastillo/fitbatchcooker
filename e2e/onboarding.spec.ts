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

test("a custom target is shown as typed, never converted like a weight", async ({
  page,
}) => {
  await signUp(page);

  // Regression: this value used to go through the 2 g/kg weight→target rule (140 → 280 g).
  await page.getByRole("checkbox", { name: /Customize|Personnaliser/i }).check();
  await page.locator('input[name="proteinTargetG"]').fill("140");

  await expect(page.getByText("140 g")).toBeVisible();
  await expect(page.getByText("280 g")).toHaveCount(0);
});

test("the welcome screen focuses the first field, not the weight", async ({
  page,
}) => {
  await signUp(page);

  await expect(page.locator('input[name="firstName"]')).toBeFocused();
});

test("revisiting the welcome screen once onboarded redirects to the batch list", async ({
  page,
}) => {
  await signUp(page);
  await page.locator('input[name="weightKg"]').fill("78");
  await page.getByRole("button", { name: /Let's go|C'est parti/i }).click();
  await page.waitForURL(/\/batch/, { timeout: 10_000 });

  // A stale bookmark/URL must not reopen onboarding; profile edits live on /account.
  await page.goto("/welcome");
  await page.waitForURL(/\/batch$/, { timeout: 10_000 });
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

// ---------------- Guided tour ----------------
// The tour is armed by `?tour=1` only, never by a DB flag — which is also why the smoke
// suite (whose accounts never visit that URL) can't be intercepted by it.

test("completing the welcome screen opens the guided tour", async ({ page }) => {
  await signUp(page);
  await page.locator('input[name="weightKg"]').fill("78");
  await page.getByRole("button", { name: /Let's go|C'est parti/i }).click();
  await page.waitForURL(/\/batch/, { timeout: 10_000 });

  const tour = page.getByRole("dialog");
  await expect(tour).toBeVisible();
  await expect(tour.getByText("1/4")).toBeVisible();

  // `?tour=1` is stripped on start so a reload doesn't replay it.
  await expect(page).not.toHaveURL(/tour=1/);
  await page.reload();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("the tour walks four steps and then closes", async ({ page }) => {
  await signUp(page);
  await page.goto("/batch?tour=1");

  const tour = page.getByRole("dialog");
  await expect(tour.getByText("1/4")).toBeVisible();

  for (const [step, selector] of [
    ["2/4", '[data-tour="nav-chat"]'],
    ["3/4", '[data-tour="nav-recipes"]'],
    ["4/4", '[data-tour="batch-new"]'],
  ] as const) {
    await tour.getByRole("button", { name: /Next|Suivant/i }).click();
    await expect(tour.getByText(step)).toBeVisible();

    // The spotlight must end up concentric with the highlighted element and share its
    // rounding — otherwise square corners of undimmed page stick out past the green outline.
    // (Wait out the 300ms glide between targets first.)
    await page.waitForTimeout(500);
    const geometry = await page.evaluate((sel) => {
      const target = [...document.querySelectorAll<HTMLElement>(sel)].find((el) =>
        el.checkVisibility({ checkVisibilityCSS: true }),
      )!;
      const spot = [...document.body.querySelectorAll("div[aria-hidden]")].find(
        (el) => (el as HTMLElement).style.boxShadow?.includes("9999px"),
      ) as HTMLElement;
      const t = target.getBoundingClientRect();
      const s = spot.getBoundingClientRect();
      return {
        dTop: s.top - t.top,
        dLeft: s.left - t.left,
        dWidth: s.width - t.width,
        radiusGap:
          Number.parseFloat(spot.style.borderRadius) -
          Number.parseFloat(getComputedStyle(target).borderTopLeftRadius),
      };
    }, selector);
    expect(geometry.dTop).toBeCloseTo(-6, 0);
    expect(geometry.dLeft).toBeCloseTo(-6, 0);
    expect(geometry.dWidth).toBeCloseTo(12, 0);
    expect(geometry.radiusGap).toBeCloseTo(6, 1);
  }

  // Last step offers Done instead of Next/Skip.
  await expect(tour.getByRole("button", { name: /Skip|Passer/i })).toHaveCount(0);
  await tour.getByRole("button", { name: /Done|Terminé/i }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("the tour is relaunchable from the account page", async ({ page }) => {
  await signUp(page);
  await page.goto("/account");

  await page
    .getByRole("link", { name: /Replay the tour|Relancer la visite/i })
    .click();

  await page.waitForURL(/\/batch/, { timeout: 10_000 });
  await expect(page.getByRole("dialog")).toBeVisible();
});
