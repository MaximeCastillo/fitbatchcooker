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

    // WRITE: create a recipe owned by the current user, reusing/creating shared
    // ingredients. Only call after the user has explicitly confirmed the proposal.
    create_recipe: tool({
      description:
        "Crée une recette pour l'utilisateur. À n'appeler QU'APRÈS confirmation explicite de l'utilisateur. Réutilise les ingrédients du catalogue (cherchés au préalable) et ne fournit protéines/100 g + catégorie que pour les ingrédients réellement absents.",
      inputSchema: createRecipeInput,
      execute: async (input) => {
        // Merge duplicate ingredient names within the call (one row per ingredient per
        // recipe — @@unique([recipeId, ingredientId])).
        const merged = new Map<
          string,
          {
            name: string;
            quantityG: number;
            proteinPer100g?: number;
            category?: (typeof input.ingredients)[number]["category"];
          }
        >();
        for (const ing of input.ingredients) {
          const key = normalizeName(ing.name);
          const prev = merged.get(key);
          if (prev) prev.quantityG += ing.quantityG;
          else merged.set(key, { ...ing });
        }

        const recipe = await prisma.$transaction(async (tx) => {
          const links: { ingredientId: string; quantityG: number }[] = [];
          for (const [key, ing] of merged) {
            const existing = await tx.ingredient.findUnique({
              where: { normalizedName: key },
              select: { id: true },
            });
            const ingredient =
              existing ??
              (await tx.ingredient.create({
                data: {
                  name: ing.name.trim(),
                  normalizedName: key,
                  category: ing.category ?? "OTHER",
                  proteinPer100g: ing.proteinPer100g ?? 0,
                },
                select: { id: true },
              }));
            links.push({ ingredientId: ingredient.id, quantityG: ing.quantityG });
          }

          const created = await tx.recipe.create({
            data: {
              userId,
              title: input.title.trim(),
              summary: input.summary,
              steps: input.steps,
              mealType: input.mealType,
              ingredients: { create: links },
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
