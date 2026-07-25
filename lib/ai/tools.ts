import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { normalizeName } from "@/lib/ingredients";
import { recomputeRecipeProtein } from "@/lib/recipes";
import {
  savePreferenceInput,
  searchIngredientsInput,
  createRecipeInput,
} from "@/lib/ai/schemas";

// Tools are built per-request with the authenticated userId closed over, so writes are
// ALWAYS scoped to the logged-in user — never to an id the model could propose.
export function chefTools(userId: string) {
  return {
    save_preference: tool({
      description:
        "Enregistre une préférence de l'utilisateur LIÉE À L'ALIMENTATION, LA CUISINE OU LA NUTRITION (goût, aversion, contrainte alimentaire, garde-manger, occasion de repas, objectif). NE PAS appeler pour un sujet hors de ce domaine (ex. loisirs non alimentaires comme les voitures).",
      inputSchema: savePreferenceInput,
      execute: async (input) => {
        const preference = await prisma.preference.create({
          data: { userId, ...input },
        });
        return { saved: true, id: preference.id };
      },
    }),

    // READ-ONLY: reuse the shared catalog (and its researched protein values) before
    // composing, and dedupe against existing rows.
    search_ingredients: tool({
      description:
        "Cherche des ingrédients dans le catalogue partagé (par nom). À utiliser AVANT de composer une recette, pour réutiliser les ingrédients existants et leurs protéines/100 g au lieu d'inventer des valeurs.",
      inputSchema: searchIngredientsInput,
      execute: async ({ query }) => {
        const ingredients = await prisma.ingredient.findMany({
          where: { normalizedName: { contains: normalizeName(query) } },
          select: { name: true, category: true, proteinPer100g: true },
          take: 10,
        });
        return { ingredients };
      },
    }),

    // WRITE: create a recipe owned by the current user, composed ONLY from existing
    // catalog ingredients (locked catalog — the chef can't invent ingredients). Only
    // call after the user has explicitly confirmed the proposal.
    create_recipe: tool({
      description:
        "Crée une recette pour l'utilisateur. À n'appeler QU'APRÈS confirmation explicite. Les ingrédients doivent TOUS exister dans le catalogue partagé (cherchés au préalable via search_ingredients) — si un ingrédient n'existe pas, choisis-en un proche qui existe, n'en invente jamais.",
      inputSchema: createRecipeInput,
      execute: async (input) => {
        // Merge duplicate ingredient names within the call (one row per ingredient per
        // recipe — @@unique([recipeId, ingredientId])).
        const merged = new Map<string, { name: string; quantityG: number }>();
        for (const ing of input.ingredients) {
          const key = normalizeName(ing.name);
          const prev = merged.get(key);
          if (prev) prev.quantityG += ing.quantityG;
          else merged.set(key, { name: ing.name, quantityG: ing.quantityG });
        }

        // Resolve every ingredient to an EXISTING catalog row. Unknown names are rejected
        // (not created) so the model retries with real catalog ingredients.
        const keys = [...merged.keys()];
        const rows = await prisma.ingredient.findMany({
          where: { normalizedName: { in: keys } },
          select: { id: true, normalizedName: true },
        });
        const idByKey = new Map(rows.map((r) => [r.normalizedName, r.id]));
        const unknown = [...merged.values()]
          .filter((ing) => !idByKey.has(normalizeName(ing.name)))
          .map((ing) => ing.name);
        if (unknown.length > 0) {
          return {
            created: false,
            error: `Ingrédients absents du catalogue : ${unknown.join(", ")}. Utilise search_ingredients et ne garde que des ingrédients existants.`,
          };
        }

        const recipe = await prisma.$transaction(async (tx) => {
          const links = [...merged.entries()].map(([key, ing]) => ({
            ingredientId: idByKey.get(key)!,
            quantityG: ing.quantityG,
          }));

          const created = await tx.recipe.create({
            data: {
              userId,
              title: input.title.trim(),
              summary: input.summary,
              steps: input.steps,
              mealType: input.mealType,
              ingredients: { create: links },
              // Auto-save to the author's book so it's immediately composable in a batch.
              savedBy: { create: { userId } },
            },
            select: { id: true },
          });
          const proteinPerServingG = await recomputeRecipeProtein(created.id, tx);
          return { id: created.id, proteinPerServingG };
        });

        return {
          created: true,
          recipeId: recipe.id,
          proteinPerServingG: recipe.proteinPerServingG,
          title: input.title.trim(),
        };
      },
    }),
  };
}
