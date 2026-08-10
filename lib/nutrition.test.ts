import { describe, it, expect } from "vitest";
import {
  dayProteinG,
  dailyProteinTargetG,
  targetFromWeightInput,
  isDayComplete,
  dayProgressPct,
  batchQuota,
  totalPortions,
  recipeProteinG,
} from "./nutrition";

describe("dayProteinG", () => {
  it("sums protein across parts (one entry = one part)", () => {
    expect(
      dayProteinG([
        { proteinPerServingG: 45 },
        { proteinPerServingG: 20 },
        { proteinPerServingG: 20 },
      ]),
    ).toBe(85);
  });

  it("treats null protein as 0", () => {
    expect(dayProteinG([{ proteinPerServingG: null }])).toBe(0);
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

describe("targetFromWeightInput", () => {
  it("derives 2 g/kg from a typed weight", () => {
    expect(targetFromWeightInput("78")).toBe(156);
  });

  it("rounds a decimal weight", () => {
    expect(targetFromWeightInput("77.4")).toBe(155);
  });

  it("returns null while the field is still empty", () => {
    expect(targetFromWeightInput("")).toBeNull();
    expect(targetFromWeightInput("   ")).toBeNull();
  });

  it("returns null instead of NaN for nonsense input", () => {
    expect(targetFromWeightInput("abc")).toBeNull();
  });

  it("rejects zero and negative weights", () => {
    expect(targetFromWeightInput("0")).toBeNull();
    expect(targetFromWeightInput("-70")).toBeNull();
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
  it("counts the parts (entries) per recipe over the whole period", () => {
    const quota = batchQuota([
      { recipeId: "poulet" },
      { recipeId: "poulet" },
      { recipeId: "saumon" },
      { recipeId: "saumon" },
    ]);
    expect(quota).toEqual({ poulet: 2, saumon: 2 });
  });

  it("returns an empty object with no entries", () => {
    expect(batchQuota([])).toEqual({});
  });
});

describe("totalPortions", () => {
  it("counts all parts (entries)", () => {
    expect(totalPortions([{}, {}, {}, {}])).toBe(4);
  });
});

describe("recipeProteinG", () => {
  it("derives one ingredient's part protein (chicken 120g @21g/100g ≈ 25g)", () => {
    expect(
      recipeProteinG([{ proteinPer100g: 21, quantityG: 120 }]),
    ).toBe(25);
  });

  it("sums several ingredients", () => {
    // 120g chicken @21 (25.2) + 80g rice @2.7 (2.16) + 100g broccoli @2.8 (2.8) ≈ 30
    expect(
      recipeProteinG([
        { proteinPer100g: 21, quantityG: 120 },
        { proteinPer100g: 2.7, quantityG: 80 },
        { proteinPer100g: 2.8, quantityG: 100 },
      ]),
    ).toBe(30);
  });

  it("is 0 for a recipe with no ingredients", () => {
    expect(recipeProteinG([])).toBe(0);
  });

  it("rounds to whole grams", () => {
    expect(recipeProteinG([{ proteinPer100g: 10, quantityG: 55 }])).toBe(6); // 5.5 → 6
  });
});
