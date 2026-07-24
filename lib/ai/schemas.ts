import { z } from "zod";

// Pure Zod schemas for the chef's tools — NO DB imports, so they're cheap to unit-test.
// This is our "validate the model's output" guard (spec §5 / bot security).
export const savePreferenceInput = z.object({
  type: z
    .string()
    .min(1)
    .describe(
      "Catégorie libre: goût, aversion, contrainte, garde-manger, occasion, objectif…",
    ),
  value: z
    .string()
    .min(1)
    .describe("La préférence en une phrase courte. Ex: « adore le poulet »"),
  sentiment: z
    .enum(["like", "dislike", "neutral"])
    .optional()
    .describe("Ressenti de l'utilisateur vis-à-vis de cette préférence"),
  note: z.string().optional().describe("Détail optionnel"),
});

// Ingredient categories (English enum values, must match Prisma's IngredientCategory).
const INGREDIENT_CATEGORIES = [
  "MEAT",
  "FISH",
  "VEGETABLE",
  "DAIRY_EGG",
  "STARCH",
  "FRUIT",
  "NUTS_SEEDS",
  "LEGUME",
  "FAT",
  "OTHER",
] as const;

// The chef searches the shared ingredient catalog (by name) BEFORE composing a recipe,
// to reuse existing ingredients + their protein values instead of inventing numbers.
export const searchIngredientsInput = z.object({
  query: z
    .string()
    .min(1)
    .describe("Nom d'ingrédient à chercher dans le catalogue partagé (ex: « poulet »)"),
});

// The chef proposes a recipe; we validate it before writing. A recipe is ONE part —
// quantityG is grams per part. proteinPer100g/category are only for ingredients ABSENT
// from the catalog (for existing ones we reuse the stored values). The 0-100 clamp is a
// cheap guard against implausible model output (PRINCIPLES §3: plausible first try).
export const createRecipeInput = z.object({
  title: z.string().min(1).describe("Titre de la recette, en français"),
  summary: z.string().optional().describe("Résumé court (une phrase), optionnel"),
  steps: z
    .array(z.string().min(1))
    .min(1)
    .describe("Étapes de préparation, dans l'ordre"),
  mealType: z
    .enum(["MAIN", "SNACK", "BREAKFAST"])
    .describe("MAIN (plat complet) | SNACK (encas) | BREAKFAST (petit-déjeuner)"),
  ingredients: z
    .array(
      z.object({
        name: z
          .string()
          .min(1)
          .describe("Nom de l'ingrédient en français (ex: « blanc de poulet »)"),
        quantityG: z
          .number()
          .int()
          .positive()
          .describe("Quantité en grammes POUR UNE PART"),
        proteinPer100g: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe(
            "Protéines pour 100 g (0-100). À fournir UNIQUEMENT pour un ingrédient absent du catalogue ; valeur plausible.",
          ),
        category: z
          .enum(INGREDIENT_CATEGORIES)
          .optional()
          .describe("Catégorie (pour un ingrédient absent du catalogue)"),
      }),
    )
    .min(1)
    .describe("Ingrédients de la recette avec leur quantité pour une part"),
});
