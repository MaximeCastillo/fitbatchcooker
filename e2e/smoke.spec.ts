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

// Controls that navigate must expose the link role, not the button role. They're styled as
// buttons via ButtonLink; the previous `<Button render={<Link/>}>` made them announce as
// buttons because Base UI forces role="button" once nativeButton is false.
test("public: buttons that navigate are exposed as links", async ({ page }) => {
  await page.goto("/");

  for (const name of [
    /Create an account|Créer un compte/i,
    /See the recipes|Voir les recettes/i,
    /Sign in|Se connecter/i,
  ]) {
    await expect(page.getByRole("link", { name }).first()).toBeVisible();
    await expect(page.getByRole("button", { name })).toHaveCount(0);
  }
});

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

  test("meal-type filters are multi-select and mirrored in the URL", async ({
    page,
  }) => {
    await signUp(page);
    await page.goto("/recipes");
    const snacks = page.getByRole("button", { name: /^(Snacks|Encas)$/ });
    const breakfast = page.getByRole("button", { name: /^(Breakfast|Petit-déj)$/ });
    const all = page.getByRole("button", { name: /^(All|Tous)$/ });

    await snacks.click();
    await expect(page).toHaveURL(/meal=SNACK(&|$)/);
    // a second type ADDS to the selection instead of replacing it
    await breakfast.click();
    await expect(page).toHaveURL(/meal=SNACK%2CBREAKFAST|meal=SNACK,BREAKFAST/);
    await expect(snacks).toHaveAttribute("aria-pressed", "true");
    await expect(breakfast).toHaveAttribute("aria-pressed", "true");
    // clicking an active chip again removes just that one
    await snacks.click();
    await expect(page).toHaveURL(/meal=BREAKFAST(&|$)/);
    // "All" clears the whole selection
    await all.click();
    await expect(page).not.toHaveURL(/meal=/);
    await expect(all).toHaveAttribute("aria-pressed", "true");

    // favorites is an independent filter
    await page.getByRole("button", { name: /Favorites|Favoris/i }).click();
    await expect(page).toHaveURL(/fav=1/);
  });

  test("browser Back closes the preview modal instead of leaving the list", async ({
    page,
  }) => {
    await signUp(page);
    // A known previous entry, so "one Back leaves the list" is a deterministic assertion.
    await page.goto("/ingredients");
    await page.goto("/recipes");
    await page.getByRole("button", { name: /^(Snacks|Encas)$/ }).click();
    await expect(page).toHaveURL(/meal=SNACK/);

    const card = page.locator('a[href*="/recipes/"]:not([href$="/new"])').first();
    await expect(card).toBeVisible();
    const dialog = page.locator('[role="dialog"]');

    // Back dismisses the modal and keeps us on the filtered list
    await card.click();
    await expect(dialog).toBeVisible();
    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(/\/recipes\?.*meal=SNACK/);
    await expect(
      page.getByRole("button", { name: /^(Snacks|Encas)$/ }),
    ).toHaveAttribute("aria-pressed", "true");

    // Closing by other means consumes the entry too, so Back doesn't need two presses.
    await card.click();
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await page.waitForTimeout(500); // let the modal's own history.back() land
    await page.goBack();
    await expect(page).toHaveURL(/\/ingredients/);
  });

  test("tapping a card opens the preview modal, and the filters survive the full page", async ({
    page,
  }) => {
    await signUp(page);
    await page.goto("/recipes");
    await page.getByRole("button", { name: /^(Snacks|Encas)$/ }).click();
    await expect(page).toHaveURL(/meal=SNACK/);

    // a card opens the modal over the list — no navigation
    const card = page.locator('a[href*="/recipes/"]:not([href$="/new"])').first();
    await expect(card).toBeVisible();
    await card.click();
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/meal=SNACK/);

    // the modal's link goes to the standalone page, carrying the filters...
    await dialog
      .getByRole("link", { name: /Open full page|Voir la page complète/i })
      .click();
    await page.waitForURL(/\/recipes\/[0-9a-f-]{8}/, { timeout: 8_000 });

    // ...so the detail page's own back link restores them
    await page
      .getByRole("link", { name: /All recipes|Toutes les recettes/i })
      .click();
    await page.waitForURL(/meal=SNACK/, { timeout: 8_000 });
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
