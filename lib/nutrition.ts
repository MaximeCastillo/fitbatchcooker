// Pure planning/nutrition helpers — NO DB imports, so they're cheap to unit-test.
// Protein currently comes from recipe.proteinPerServingG (an estimate). When the
// ingredient layer lands, only the *source* of that number changes — not these
// functions. See ROADMAP.

export type ProteinEntry = {
  proteinPerServingG: number | null;
};

// Total protein (g) placed on a day. One entry = one part; placing a recipe twice means
// two entries (there is no per-entry servings count).
export function dayProteinG(entries: ProteinEntry[]): number {
  return entries.reduce(
    (sum, entry) => sum + (entry.proteinPerServingG ?? 0),
    0,
  );
}

// The user's daily protein target: an explicit value wins; otherwise ~2 g/kg of body
// weight when we have it; otherwise null (not set yet).
export function dailyProteinTargetG(user: {
  proteinTargetG?: number | null;
  weightKg?: number | null;
}): number | null {
  if (user.proteinTargetG != null && user.proteinTargetG > 0) {
    return user.proteinTargetG;
  }
  if (user.weightKg != null && user.weightKg > 0) {
    return Math.round(user.weightKg * 2);
  }
  return null;
}

// Same 2 g/kg rule as above, but from a raw form input string: the profile and welcome
// forms both derive the goal live while the user types. Empty or nonsense input → null
// (nothing to show yet), never NaN.
export function targetFromWeightInput(weight: string): number | null {
  const kg = Number(weight);
  if (weight.trim() === "" || !Number.isFinite(kg) || kg <= 0) return null;
  return Math.round(kg * 2);
}

// A custom target typed by the user is ALREADY in grams — no 2 g/kg conversion, just
// the same empty/nonsense → null validation as above.
export function parseTargetInput(target: string): number | null {
  const grams = Number(target);
  if (target.trim() === "" || !Number.isFinite(grams) || grams <= 0) return null;
  return Math.round(grams);
}

// A day turns "green" once it reaches the target.
export function isDayComplete(totalG: number, targetG: number | null): boolean {
  return targetG != null && targetG > 0 && totalG >= targetG;
}

// Fill ratio 0..100 for the gauge (clamped). No target → 0.
export function dayProgressPct(totalG: number, targetG: number | null): number {
  if (targetG == null || targetG <= 0) return 0;
  return Math.min(100, Math.round((totalG / targetG) * 100));
}

// Batch quota: number of parts to cook per recipe across the whole plan (one entry =
// one part, so this counts the entries per recipe).
export function batchQuota(
  entries: { recipeId: string }[],
): Record<string, number> {
  const quota: Record<string, number> = {};
  for (const entry of entries) {
    quota[entry.recipeId] = (quota[entry.recipeId] ?? 0) + 1;
  }
  return quota;
}

// Total parts to cook across the whole plan.
export function totalPortions(entries: unknown[]): number {
  return entries.length;
}

export type RecipeIngredientAmount = {
  proteinPer100g: number;
  quantityG: number;
};

// Protein (g) of ONE part of a recipe = sum of each ingredient's contribution
// (proteinPer100g × quantityG / 100). A recipe is one part in the MVP — to eat more,
// place it several times in the batch (no per-recipe servings). Rounded to whole grams
// to match the cached Recipe.proteinPerServingG column and the "g protéines" UI. This
// is deliberately "à la louche" (PRINCIPLES §1) — regularity over precision.
export function recipeProteinG(ingredients: RecipeIngredientAmount[]): number {
  const total = ingredients.reduce(
    (sum, ing) => sum + (ing.proteinPer100g * ing.quantityG) / 100,
    0,
  );
  return Math.round(total);
}
