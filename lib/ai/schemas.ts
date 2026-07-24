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

// The chef searches the shared ingredient catalog (by name) BEFORE composing a recipe,
// to reuse existing ingredients + their protein values instead of inventing numbers.
export const searchIngredientsInput = z.object({
  query: z
    .string()
    .min(1)
    .describe("Nom d'ingrédient à chercher dans le catalogue partagé (ex: « poulet »)"),
});

// The chef proposes a recipe; we validate it before writing. A recipe is ONE part —
// quantityG is grams per part. Ingredients MUST come from the shared catalog (locked):
// the chef references them by name (found via search_ingredients) and we resolve each to
// an existing row — it can NOT invent new ingredients or protein values.
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
          .describe(
            "Nom EXACT d'un ingrédient du catalogue partagé (trouvé via search_ingredients). Aucun ingrédient hors catalogue.",
          ),
        quantityG: z
          .number()
          .int()
          .positive()
          .describe("Quantité en grammes POUR UNE PART"),
      }),
    )
    .min(1)
    .describe("Ingrédients de la recette (issus du catalogue) avec leur quantité par part"),
});
