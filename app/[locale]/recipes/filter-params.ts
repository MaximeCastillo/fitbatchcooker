import type { MealType } from "@/lib/generated/prisma/enums";

// The browse filters live in the URL query (?q=…&meal=MAIN,SNACK&fav=1) rather than in
// component state alone, so leaving the list for a recipe page and coming back restores
// exactly what was checked. This module is the single source of truth for that encoding:
// the server page reads it for the first render, the client browser writes it on change,
// and the detail page round-trips it to build a filter-preserving "back" link.
export const MEAL_TYPES: MealType[] = ["MAIN", "SNACK", "BREAKFAST"];

export type RecipeQuery = { q?: string; meal?: string; fav?: string };

export type ParsedRecipeFilters = {
  search: string;
  mealTypes: MealType[];
  favoritesOnly: boolean;
};

// Parse + validate: unknown meal types are dropped, so anything arbitrary in the URL
// degrades to "All" instead of reaching the query.
export function parseRecipeFilters(query: RecipeQuery): ParsedRecipeFilters {
  const mealTypes = (query.meal ?? "")
    .split(",")
    .filter((value): value is MealType => MEAL_TYPES.includes(value as MealType));

  return {
    search: query.q?.trim() ?? "",
    // De-duplicate so a hand-written ?meal=SNACK,SNACK stays a clean single chip.
    mealTypes: [...new Set(mealTypes)],
    favoritesOnly: query.fav === "1",
  };
}

// Inverse of parseRecipeFilters. Returns "" when nothing is filtered, so the caller can
// keep the URL clean (`/recipes` rather than `/recipes?`).
export function serializeRecipeFilters(filters: ParsedRecipeFilters): string {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  // Keep a stable order so the same selection always yields the same URL.
  const mealTypes = MEAL_TYPES.filter((mt) => filters.mealTypes.includes(mt));
  if (mealTypes.length > 0) params.set("meal", mealTypes.join(","));
  if (filters.favoritesOnly) params.set("fav", "1");
  return params.toString();
}

export function parseRecipeQueryString(rawQuery: string): ParsedRecipeFilters {
  const params = new URLSearchParams(rawQuery);
  return parseRecipeFilters({
    q: params.get("q") ?? undefined,
    meal: params.get("meal") ?? undefined,
    fav: params.get("fav") ?? undefined,
  });
}

// Sanitize a query string that arrived as data (the `?from=` hand-off from the preview
// modal to the detail page): round-trip it through the whitelist so only known filter
// params survive.
export function sanitizeRecipeQuery(rawQuery: string | undefined): string {
  if (!rawQuery) return "";
  return serializeRecipeFilters(parseRecipeQueryString(rawQuery));
}
