import type { IngredientCategory } from "@/lib/generated/prisma/enums";

// Category picto: one emoji per ingredient family, so a chip/list never shows a missing
// icon. Language-neutral (the category *label* is bilingual via messages/*.json). Also
// drives the ingredients-page filter.
export const INGREDIENT_PICTO: Record<IngredientCategory, string> = {
  MEAT: "🥩",
  FISH: "🐟",
  VEGETABLE: "🥦",
  DAIRY_EGG: "🥚",
  STARCH: "🍚",
  FRUIT: "🍎",
  NUTS_SEEDS: "🥜",
  LEGUME: "🫘",
  // Basics/condiments assumed on hand: oil, salt, pepper, honey, spices…
  CONDIMENT: "🧂",
  // Neutral container: holds anything that fits no other family.
  OTHER: "📦",
};

// Dedup key for the shared ingredient catalog: lowercased, accent-stripped, whitespace
// collapsed. The chef normalizes a proposed ingredient name to this before deciding to
// reuse an existing row or create a new one; it also backs the `normalizedName @unique`
// column. So "Blanc de poulet ", "blanc de POULET" and "Blanc  de  Poulet" all match.
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
