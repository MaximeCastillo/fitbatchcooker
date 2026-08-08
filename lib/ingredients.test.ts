import { describe, expect, it } from "vitest";
import { ingredientName, ingredientPicto, normalizeName } from "./ingredients";

describe("normalizeName", () => {
  it("strips accents so a query without them still matches", () => {
    expect(normalizeName("Épinards")).toBe("epinards");
    expect(normalizeName("Crème fraîche")).toBe("creme fraiche");
  });

  it("lowercases, trims and collapses inner whitespace", () => {
    expect(normalizeName("  Blanc  de   POULET ")).toBe("blanc de poulet");
  });

  it("gives the same key for every spelling of one ingredient", () => {
    const spellings = ["Blanc de poulet", "blanc de POULET", "Blanc  de  Poulet "];
    const keys = new Set(spellings.map(normalizeName));
    expect(keys.size).toBe(1);
  });
});

describe("ingredientName", () => {
  const chicken = { nameFr: "Blanc de poulet", nameEn: "Chicken breast" };

  it("shows the French name to a French reader", () => {
    expect(ingredientName(chicken, "fr")).toBe("Blanc de poulet");
  });

  it("shows the English name to an English reader", () => {
    expect(ingredientName(chicken, "en")).toBe("Chicken breast");
  });

  it("falls back to English for an unknown locale (the app's defaultLocale)", () => {
    expect(ingredientName(chicken, "de")).toBe("Chicken breast");
  });
});

describe("ingredientPicto", () => {
  it("prefers the ingredient's own emoji", () => {
    expect(ingredientPicto({ picto: "🍗", category: "MEAT" })).toBe("🍗");
  });

  it("falls back to the category emoji when the ingredient has none", () => {
    expect(ingredientPicto({ picto: null, category: "MEAT" })).toBe("🥩");
  });
});
