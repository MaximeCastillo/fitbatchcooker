// Pure planning/nutrition helpers — NO DB imports, so they're cheap to unit-test.
// Protein currently comes from recipe.proteinPerServingG (an estimate). When the
// ingredient layer lands, only the *source* of that number changes — not these
// functions. See ROADMAP.

export type ProteinEntry = {
  servings: number;
  proteinPerServingG: number | null;
};

// Total protein (g) placed on a day.
export function dayProteinG(entries: ProteinEntry[]): number {
  return entries.reduce(
    (sum, entry) => sum + entry.servings * (entry.proteinPerServingG ?? 0),
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

// A day turns "green" once it reaches the target.
export function isDayComplete(totalG: number, targetG: number | null): boolean {
  return targetG != null && targetG > 0 && totalG >= targetG;
}

// Fill ratio 0..100 for the gauge (clamped). No target → 0.
export function dayProgressPct(totalG: number, targetG: number | null): number {
  if (targetG == null || targetG <= 0) return 0;
  return Math.min(100, Math.round((totalG / targetG) * 100));
}

// Batch quota: total portions to cook per recipe across the whole plan.
export function batchQuota(
  entries: { recipeId: string; servings: number }[],
): Record<string, number> {
  const quota: Record<string, number> = {};
  for (const entry of entries) {
    quota[entry.recipeId] = (quota[entry.recipeId] ?? 0) + entry.servings;
  }
  return quota;
}

// Total portions to cook across the whole plan.
export function totalPortions(entries: { servings: number }[]): number {
  return entries.reduce((sum, entry) => sum + entry.servings, 0);
}
