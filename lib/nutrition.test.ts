import { describe, it, expect } from "vitest";
import {
  dayProteinG,
  dailyProteinTargetG,
  isDayComplete,
  dayProgressPct,
  batchQuota,
  totalPortions,
} from "./nutrition";

describe("dayProteinG", () => {
  it("somme protéines × parts", () => {
    expect(
      dayProteinG([
        { servings: 1, proteinPerServingG: 45 },
        { servings: 2, proteinPerServingG: 20 },
      ]),
    ).toBe(85);
  });

  it("traite les protéines nulles comme 0", () => {
    expect(dayProteinG([{ servings: 3, proteinPerServingG: null }])).toBe(0);
  });

  it("vaut 0 pour un jour vide", () => {
    expect(dayProteinG([])).toBe(0);
  });
});

describe("dailyProteinTargetG", () => {
  it("privilégie l'objectif explicite", () => {
    expect(dailyProteinTargetG({ proteinTargetG: 120, weightKg: 80 })).toBe(120);
  });

  it("retombe sur 2 g/kg si pas d'objectif explicite", () => {
    expect(dailyProteinTargetG({ weightKg: 75 })).toBe(150);
  });

  it("arrondit la valeur calculée depuis le poids", () => {
    expect(dailyProteinTargetG({ weightKg: 72.5 })).toBe(145);
  });

  it("retourne null si ni objectif ni poids", () => {
    expect(dailyProteinTargetG({})).toBeNull();
    expect(dailyProteinTargetG({ proteinTargetG: 0, weightKg: 0 })).toBeNull();
  });
});

describe("isDayComplete", () => {
  it("vrai quand l'apport atteint ou dépasse l'objectif", () => {
    expect(isDayComplete(120, 120)).toBe(true);
    expect(isDayComplete(130, 120)).toBe(true);
  });

  it("faux en dessous de l'objectif", () => {
    expect(isDayComplete(95, 120)).toBe(false);
  });

  it("faux si l'objectif est absent ou nul", () => {
    expect(isDayComplete(100, null)).toBe(false);
    expect(isDayComplete(100, 0)).toBe(false);
  });
});

describe("dayProgressPct", () => {
  it("calcule un pourcentage arrondi", () => {
    expect(dayProgressPct(60, 120)).toBe(50);
    expect(dayProgressPct(95, 120)).toBe(79);
  });

  it("plafonne à 100", () => {
    expect(dayProgressPct(200, 120)).toBe(100);
  });

  it("vaut 0 sans objectif", () => {
    expect(dayProgressPct(100, null)).toBe(0);
    expect(dayProgressPct(100, 0)).toBe(0);
  });
});

describe("batchQuota", () => {
  it("agrège les portions par recette sur toute la période", () => {
    const quota = batchQuota([
      { recipeId: "poulet", servings: 1 },
      { recipeId: "poulet", servings: 1 },
      { recipeId: "saumon", servings: 2 },
    ]);
    expect(quota).toEqual({ poulet: 2, saumon: 2 });
  });

  it("retourne un objet vide sans entrée", () => {
    expect(batchQuota([])).toEqual({});
  });
});

describe("totalPortions", () => {
  it("somme toutes les parts", () => {
    expect(
      totalPortions([{ servings: 1 }, { servings: 2 }, { servings: 1 }]),
    ).toBe(4);
  });
});
