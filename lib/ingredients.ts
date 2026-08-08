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

// The emoji to show for an ingredient: its own picto when set, else the category picto as
// a safe fallback (so a chip/list never shows a missing icon).
export function ingredientPicto(ingredient: {
  picto?: string | null;
  category: IngredientCategory;
}): string {
  return ingredient.picto ?? INGREDIENT_PICTO[ingredient.category];
}

// The name to show for an ingredient, in the reader's language. The catalog is bilingual
// (nameFr / nameEn) and EVERY display site goes through this helper, so no caller has to
// remember which column holds which language. Unknown locale → English (the app's
// defaultLocale, see i18n/routing.ts).
// Structural param type (like ingredientPicto) so any `select` pulling both names fits,
// and a plain `locale: string` so this stays usable from Server Components, Client
// Components, the seed and tests alike — no next-intl import.
export function ingredientName(
  ingredient: { nameFr: string; nameEn: string },
  locale: string,
): string {
  return locale === "fr" ? ingredient.nameFr : ingredient.nameEn;
}

// Dedup key for the shared ingredient catalog: lowercased, accent-stripped, whitespace
// collapsed. Backs BOTH `normalizedNameFr` and `normalizedNameEn` (@unique), and the chef
// normalizes a proposed name to this to resolve it against either language.
// So "Blanc de poulet ", "blanc de POULET" and "Blanc  de  Poulet" all match.
export function normalizeName(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}
