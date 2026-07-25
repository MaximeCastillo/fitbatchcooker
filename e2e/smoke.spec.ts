import { test, expect } from "@playwright/test";
import { signUp } from "./helpers";

// Basic smoke suite: every route renders (or redirects) without a client crash, plus the
// handful of critical flows. Goal = catch regressions like a whole page breaking. Serial;
// throwaway accounts are purged by the global teardown.

// ---------------- Public routes ----------------
const PUBLIC_ROUTES = ["/", "/login", "/recipes", "/ingredients"];
for (const path of PUBLIC_ROUTES) {
  test(`public route ${path} renders without error`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    const resp = await page.goto(path);
    expect(resp?.status() ?? 0, `HTTP status for ${path}`).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
    expect(errors, `page errors on ${path}`).toEqual([]);
  });
}

test("public: ingredient reverse-search modal opens", async ({ page }) => {
  await page.goto("/ingredients");
  await page.locator("main ul li button").first().click();
  await expect(page.locator('[role="dialog"]')).toBeVisible();
});

// ---------------- Protected routes redirect when signed out ----------------
const PROTECTED_ROUTES = ["/batch", "/account", "/recipes/new"];
for (const path of PROTECTED_ROUTES) {
  test(`protected route ${path} redirects to /login when signed out`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });
}

// ---------------- Authenticated flows ----------------
test.describe("signed in", () => {
  test("core pages render", async ({ page }) => {
    await signUp(page);
    for (const path of ["/account", "/batch", "/recipes/new", "/chat"]) {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(String(e)));
      await page.goto(path);
      await expect(page.locator("main, form").first()).toBeVisible();
      expect(errors, `page errors on ${path}`).toEqual([]);
    }
  });

  test("create a recipe → lands on its page (regression guard)", async ({ page }) => {
    await signUp(page);
    await page.goto("/recipes/new");
    await page.locator("form input").first().fill(`E2E recipe ${Date.now()}`);
    const select = page.locator("select").first();
    if ((await select.locator("option").count()) > 1) {
      await select.selectOption({ index: 1 });
    }
    await page.locator('input[type="number"]').first().fill("150");
    await page.locator("textarea").first().fill("A step.");
    await page
      .getByRole("button", { name: /Create recipe|Créer la recette/i })
      .click();
    await expect(page).toHaveURL(/\/recipes\/[0-9a-f-]{8}/, { timeout: 10_000 });
  });

  test("bookmark a recipe and it sticks (no revert, survives reload)", async ({
    page,
  }) => {
    await signUp(page);
    await page.goto("/recipes");
    const bookmark = page
      .getByRole("button", { name: /Save|Sauvegarder|Remove|Retirer/i })
      .first();
    await bookmark.click();
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await page.waitForTimeout(1500); // past the server round-trip that used to revert it
    await expect(bookmark).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(
      page
        .getByRole("button", { name: /Save|Sauvegarder|Remove|Retirer/i })
        .first(),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("browse filters are kept in the URL and restored on Back", async ({ page }) => {
    await signUp(page);
    await page.goto("/recipes");
    // meal-type + favorites both reflect in the URL
    await page.getByRole("button", { name: /^(Snacks|Encas)$/ }).click();
    await expect(page).toHaveURL(/meal=SNACK/);
    await page.getByRole("button", { name: /Favorites|Favoris/i }).click();
    await expect(page).toHaveURL(/fav=1/);
    // turn favorites off so the public snack list is populated to click into
    await page.getByRole("button", { name: /Favorites|Favoris/i }).click();
    await expect(page).not.toHaveURL(/fav=1/);
    // open a real recipe card (NOT the "New recipe" link) → detail → Back keeps the filter
    const card = page.locator('a[href*="/recipes/"]:not([href$="/new"])').first();
    await expect(card).toBeVisible();
    await card.click();
    await page.waitForURL(/\/recipes\/[0-9a-f-]{8}/, { timeout: 8_000 });
    await page.goBack();
    await expect(page).toHaveURL(/meal=SNACK/);
    await expect(
      page.getByRole("button", { name: /^(Snacks|Encas)$/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("open a batch composer", async ({ page }) => {
    await signUp(page);
    await page.goto("/batch");
    await page
      .getByRole("button", { name: /New batch|Nouveau batch/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/batch\/[0-9a-f-]{8}/, { timeout: 10_000 });
    // palette shows recipes (public + own) — never empty at first use
    await expect(
      page
        .locator("aside")
        .getByRole("button", { name: /Add recipe|Ajouter la recette/i })
        .first(),
    ).toBeVisible();
  });
});
