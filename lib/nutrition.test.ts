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
  it("sums protein × servings", () => {
    expect(
      dayProteinG([
        { servings: 1, proteinPerServingG: 45 },
        { servings: 2, proteinPerServingG: 20 },
      ]),
    ).toBe(85);
  });

  it("treats null protein as 0", () => {
    expect(dayProteinG([{ servings: 3, proteinPerServingG: null }])).toBe(0);
  });

  it("is 0 for an empty day", () => {
    expect(dayProteinG([])).toBe(0);
  });
});

describe("dailyProteinTargetG", () => {
  it("prefers the explicit target", () => {
    expect(dailyProteinTargetG({ proteinTargetG: 120, weightKg: 80 })).toBe(120);
  });

  it("falls back to 2 g/kg when no explicit target", () => {
    expect(dailyProteinTargetG({ weightKg: 75 })).toBe(150);
  });

  it("rounds the value computed from weight", () => {
    expect(dailyProteinTargetG({ weightKg: 72.5 })).toBe(145);
  });

  it("returns null when neither target nor weight is set", () => {
    expect(dailyProteinTargetG({})).toBeNull();
    expect(dailyProteinTargetG({ proteinTargetG: 0, weightKg: 0 })).toBeNull();
  });
});

describe("isDayComplete", () => {
  it("is true when intake meets or exceeds the target", () => {
    expect(isDayComplete(120, 120)).toBe(true);
    expect(isDayComplete(130, 120)).toBe(true);
  });

  it("is false below the target", () => {
    expect(isDayComplete(95, 120)).toBe(false);
  });

  it("is false when the target is missing or zero", () => {
    expect(isDayComplete(100, null)).toBe(false);
    expect(isDayComplete(100, 0)).toBe(false);
  });
});

describe("dayProgressPct", () => {
  it("computes a rounded percentage", () => {
    expect(dayProgressPct(60, 120)).toBe(50);
    expect(dayProgressPct(95, 120)).toBe(79);
  });

  it("caps at 100", () => {
    expect(dayProgressPct(200, 120)).toBe(100);
  });

  it("is 0 without a target", () => {
    expect(dayProgressPct(100, null)).toBe(0);
    expect(dayProgressPct(100, 0)).toBe(0);
  });
});

describe("batchQuota", () => {
  it("aggregates servings per recipe over the whole period", () => {
    const quota = batchQuota([
      { recipeId: "poulet", servings: 1 },
      { recipeId: "poulet", servings: 1 },
      { recipeId: "saumon", servings: 2 },
    ]);
    expect(quota).toEqual({ poulet: 2, saumon: 2 });
  });

  it("returns an empty object with no entries", () => {
    expect(batchQuota([])).toEqual({});
  });
});

describe("totalPortions", () => {
  it("sums all servings", () => {
    expect(
      totalPortions([{ servings: 1 }, { servings: 2 }, { servings: 1 }]),
    ).toBe(4);
  });
});
