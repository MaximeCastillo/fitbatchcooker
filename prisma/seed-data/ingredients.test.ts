import { describe, expect, it } from "vitest";
import { INGREDIENTS } from "./ingredients";
// Relative, like seed.ts: this module lives outside the `@/` alias root.
import { normalizeName } from "../../lib/ingredients";

// Guards on the hand-written catalog. A reviewer can spot an implausible number in a
// one-entry-per-line diff; a reviewer CANNOT spot a cross-language key collision between
// two rows hundreds of lines apart, in two languages — hence the resolvability tests.

describe("catalog resolvability", () => {
  it("has a unique French key per ingredient", () => {
    const seen = new Map<string, string>();
    for (const ing of INGREDIENTS) {
      const key = normalizeName(ing.fr);
      expect(seen.has(key), `duplicate French name "${ing.fr}"`).toBe(false);
      seen.set(key, ing.fr);
    }
  });

  it("has a unique English key per ingredient", () => {
    const seen = new Map<string, string>();
    for (const ing of INGREDIENTS) {
      const key = normalizeName(ing.en);
      expect(
        seen.has(key),
        `duplicate English name "${ing.en}" (${ing.fr} vs ${seen.get(key)})`,
      ).toBe(false);
      seen.set(key, ing.fr);
    }
  });

  it("never reuses one ingredient's English name as another's French name", () => {
    // Would make one of the two unreachable: lib/ai/tools.ts resolves French first.
    const frIndex = new Map(INGREDIENTS.map((ing, i) => [normalizeName(ing.fr), i]));
    INGREDIENTS.forEach((ing, index) => {
      const clash = frIndex.get(normalizeName(ing.en));
      expect(
        clash === undefined || clash === index,
        `English "${ing.en}" collides with French "${clash !== undefined ? INGREDIENTS[clash].fr : ""}"`,
      ).toBe(true);
    });
  });

  it("keeps the documented false-friend pairs distinct", () => {
    const enByFr = new Map(INGREDIENTS.map((ing) => [ing.fr, ing.en]));
    expect(enByFr.get("Raisin")).toBe("Grapes");
    expect(enByFr.get("Raisins secs")).toBe("Raisins");
    expect(enByFr.get("Prune")).toBe("Plum");
    expect(enByFr.get("Pruneaux")).toBe("Prunes");
    expect(enByFr.get("Poivre")).toBe("Black pepper");
    expect(enByFr.get("Poivron")).toBe("Bell pepper");
    expect(enByFr.get("Bar")).toBe("Sea bass");
  });
});

describe("catalog values", () => {
  // Per-category plausibility, deliberately wide: these catch a typo (a 200 g/100 g
  // ingredient), not an imprecise estimate — PRINCIPLES §1 accepts "à la louche".
  // OTHER is intentionally heterogeneous (sugar 0 → gelatin 85), so it has no range.
  const RANGES: Record<string, [number, number]> = {
    MEAT: [14, 33],
    FISH: [8, 26],
    DAIRY_EGG: [3, 36],
    STARCH: [2, 17],
    VEGETABLE: [0.5, 6],
    FRUIT: [0.2, 4],
    NUTS_SEEDS: [6, 31],
    LEGUME: [6, 25],
    CONDIMENT: [0, 12],
  };

  it("keeps protein values inside their category's plausible range", () => {
    for (const ing of INGREDIENTS) {
      const range = RANGES[ing.category];
      if (!range) continue;
      const [min, max] = range;
      expect(
        ing.proteinPer100g >= min && ing.proteinPer100g <= max,
        `${ing.fr} (${ing.category}): ${ing.proteinPer100g} outside ${min}-${max}`,
      ).toBe(true);
    }
  });

  it("avoids fake precision: integers at >= 5 g, one decimal at most below", () => {
    for (const ing of INGREDIENTS) {
      const value = ing.proteinPer100g;
      if (value >= 5) {
        expect(Number.isInteger(value), `${ing.fr}: ${value} should be integer`).toBe(true);
      } else {
        expect(
          Math.round(value * 10) === value * 10,
          `${ing.fr}: ${value} has more than one decimal`,
        ).toBe(true);
      }
    }
  });

  it("gives every ingredient a positive default quantity", () => {
    for (const ing of INGREDIENTS) {
      expect(ing.defaultQuantityG, `${ing.fr}`).toBeGreaterThan(0);
    }
  });
});
