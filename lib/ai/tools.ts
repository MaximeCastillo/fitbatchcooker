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
        "Cherche des ingrédients dans le catalogue partagé, par nom EN FRANÇAIS OU EN ANGLAIS. À utiliser AVANT de composer une recette, pour réutiliser les ingrédients existants et leurs protéines/100 g au lieu d'inventer des valeurs. Renvoie les DEUX noms de chaque ingrédient : parle à l'utilisateur avec celui de la langue de la conversation, et repasse à create_recipe l'un des deux, copié exactement.",
      inputSchema: searchIngredientsInput,
      execute: async ({ query }) => {
        // The catalog is bilingual, and the chef answers in the user's language — so it
        // may search in either. Same normalized key on both sides.
        const key = normalizeName(query);
        const ingredients = await prisma.ingredient.findMany({
          where: {
            OR: [
              { normalizedNameFr: { contains: key } },
              { normalizedNameEn: { contains: key } },
            ],
          },
          select: {
            nameFr: true,
            nameEn: true,
            category: true,
            proteinPer100g: true,
          },
          take: 20,
        });
        return { ingredients };
      },
    }),

    // WRITE: create a recipe owned by the current user, composed ONLY from existing
    // catalog ingredients (locked catalog — the chef can't invent ingredients). Only
    // call after the user has explicitly confirmed the proposal.
    create_recipe: tool({
      description:
        "Crée une recette pour l'utilisateur. À n'appeler QU'APRÈS confirmation explicite. Les ingrédients doivent TOUS exister dans le catalogue partagé (cherchés au préalable via search_ingredients), nommés en français OU en anglais — si un ingrédient n'existe pas, choisis-en un proche qui existe, n'en invente jamais.",
      inputSchema: createRecipeInput,
      execute: async (input) => {
        const proposals = input.ingredients.map((ing) => ({
          name: ing.name,
          key: normalizeName(ing.name),
          quantityG: ing.quantityG,
        }));
        const keys = [...new Set(proposals.map((p) => p.key))];

        // Resolve every proposed name to an EXISTING catalog row, in EITHER language.
        // Unknown names are rejected (not created) so the model retries with real ones.
        const rows = await prisma.ingredient.findMany({
          where: {
            OR: [
              { normalizedNameFr: { in: keys } },
              { normalizedNameEn: { in: keys } },
            ],
          },
          select: { id: true, normalizedNameFr: true, normalizedNameEn: true },
        });

        // French wins: if an English name ever collided with another row's French name,
        // the same input would still always resolve the same way. (The seed refuses such
        // a catalog outright, so this is belt-and-braces.)
        const idByKey = new Map<string, string>();
        for (const row of rows) idByKey.set(row.normalizedNameFr, row.id);
        for (const row of rows) {
          if (!idByKey.has(row.normalizedNameEn)) {
            idByKey.set(row.normalizedNameEn, row.id);
          }
        }

        const unknown = proposals
          .filter((p) => !idByKey.has(p.key))
          .map((p) => p.name);
        if (unknown.length > 0) {
          return {
            created: false,
            error: `Ingrédients absents du catalogue : ${unknown.join(", ")}. Utilise search_ingredients (le catalogue répond en français comme en anglais) et ne garde que des ingrédients existants.`,
          };
        }

        // Merge by RESOLVED id, not by name: with two languages "Ail" and "Garlic" are the
        // same ingredient, and a recipe holds one row per ingredient
        // (@@unique([recipeId, ingredientId])).
        const quantityById = new Map<string, number>();
        for (const p of proposals) {
          const ingredientId = idByKey.get(p.key)!;
          quantityById.set(
            ingredientId,
            (quantityById.get(ingredientId) ?? 0) + p.quantityG,
          );
        }

        const recipe = await prisma.$transaction(async (tx) => {
          const links = [...quantityById].map(([ingredientId, quantityG]) => ({
            ingredientId,
            quantityG,
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
