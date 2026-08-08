// Seed script — a research-backed starter library so the app is never empty.
// Run with: npx prisma db seed   (or: npx tsx prisma/seed.ts)
//
// This is the quality-critical foundation: the protein gauge that "fills a batch"
// derives entirely from these numbers. Protein/100g values are cross-checked against
// USDA FoodData Central / Ciqual (multiple sources) but rounded "à la louche"
// (PRINCIPLES §1: regularity > precision). Convention: values and quantities are for the
// ingredient AS WEIGHED / AS PURCHASED — raw meat & fish, dry rice/pasta/oats/quinoa,
// cooked/canned-drained legumes — matching PRINCIPLES §3 (blanc de poulet ~22 g/100 g raw).
//
// Idempotent and NON-DESTRUCTIVE: ingredients are upserted by normalizedName; the shared
// starter library (recipes with userId = null) is refreshed IN PLACE, matched by title,
// so each recipe keeps its id and stays in whatever batches reference it (BatchEntry is
// onDelete Cascade — deleting would silently empty users' batches). User-owned recipes
// are untouched.
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MealType } from "../lib/generated/prisma/enums";
import { normalizeName } from "../lib/ingredients";
import { recipeProteinG } from "../lib/nutrition";
import { INGREDIENTS } from "./seed-data/ingredients";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- Data -----------------------------------------------------------------------


type SeedRecipe = {
  title: string;
  summary: string;
  steps: string[];
  mealType: MealType;
  imageUrl?: string;
  // quantityG = grams of the ingredient FOR ONE PART of the recipe.
  ingredients: { name: string; quantityG: number }[];
};

// ~19 recipes covering all three meal types. Quantities chosen so the derived
// protein/part is plausible (mains ≈ 35-45 g, snacks ≈ 6-17 g, breakfasts ≈ 15-40 g).
const RECIPES: SeedRecipe[] = [
  // --- MAIN ---
  {
    title: "Poulet grillé, riz & brocoli",
    summary: "Le classique meal-prep : simple, rassasiant, très protéiné.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire le riz selon les instructions du paquet.",
      "Griller le blanc de poulet 5 min de chaque côté, saler et poivrer.",
      "Cuire le brocoli à la vapeur 6 min.",
      "Assembler le bol et arroser d'un filet d'huile d'olive.",
    ],
    ingredients: [
      { name: "Blanc de poulet", quantityG: 160 },
      { name: "Riz", quantityG: 75 },
      { name: "Brocoli", quantityG: 150 },
      { name: "Huile d'olive", quantityG: 10 },
    ],
  },
  {
    title: "Bowl de saumon, quinoa & épinards",
    summary: "Oméga-3 et protéines, parfait à emporter.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire le quinoa 12 min dans deux fois son volume d'eau.",
      "Saisir le pavé de saumon 4 min de chaque côté.",
      "Faire tomber les épinards à la poêle avec l'huile d'olive.",
      "Assembler le bowl.",
    ],
    ingredients: [
      { name: "Saumon", quantityG: 140 },
      { name: "Quinoa", quantityG: 60 },
      { name: "Épinards", quantityG: 100 },
      { name: "Huile d'olive", quantityG: 5 },
    ],
  },
  {
    title: "Chili de dinde aux haricots rouges",
    summary: "Mijoté protéiné et plein de légumes, encore meilleur réchauffé.",
    mealType: MealType.MAIN,
    steps: [
      "Faire revenir le poivron émincé.",
      "Ajouter la dinde hachée et faire dorer.",
      "Incorporer tomates, haricots rouges et épices.",
      "Laisser mijoter 25 min à feu doux.",
    ],
    ingredients: [
      { name: "Dinde hachée", quantityG: 130 },
      { name: "Haricots rouges", quantityG: 150 },
      { name: "Tomate", quantityG: 100 },
      { name: "Poivron", quantityG: 80 },
    ],
  },
  {
    title: "Pâtes au thon & tomate",
    summary: "Le dépannage express du sportif, prêt en 15 min.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire les pâtes al dente.",
      "Faire réduire les tomates avec l'huile d'olive.",
      "Ajouter le thon égoutté.",
      "Mélanger les pâtes à la sauce.",
    ],
    ingredients: [
      { name: "Pâtes", quantityG: 80 },
      { name: "Thon au naturel", quantityG: 100 },
      { name: "Tomate", quantityG: 120 },
      { name: "Huile d'olive", quantityG: 10 },
    ],
  },
  {
    title: "Steak haché, patate douce & haricots verts",
    summary: "Assiette équilibrée sans prise de tête.",
    mealType: MealType.MAIN,
    steps: [
      "Couper la patate douce en cubes et rôtir 25 min à 200°C.",
      "Cuire les haricots verts à la vapeur 8 min.",
      "Poêler le steak haché 3 min de chaque côté.",
      "Dresser l'assiette.",
    ],
    ingredients: [
      { name: "Steak haché 5% MG", quantityG: 150 },
      { name: "Patate douce", quantityG: 200 },
      { name: "Haricots verts", quantityG: 150 },
      { name: "Huile d'olive", quantityG: 5 },
    ],
  },
  {
    title: "Cabillaud rôti, pommes de terre & petits pois",
    summary: "Poisson blanc léger, doux et complet.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire les pommes de terre 20 min à l'eau.",
      "Rôtir le cabillaud 12 min à 200°C avec un filet d'huile.",
      "Réchauffer les petits pois.",
      "Servir bien chaud.",
    ],
    ingredients: [
      { name: "Cabillaud", quantityG: 150 },
      { name: "Pomme de terre", quantityG: 200 },
      { name: "Petits pois", quantityG: 100 },
      { name: "Huile d'olive", quantityG: 10 },
    ],
  },
  {
    title: "Curry de pois chiches & tofu",
    summary: "Plat végétarien complet et réconfortant.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire le riz.",
      "Dorer le tofu coupé en dés.",
      "Ajouter pois chiches, épinards et épices à curry.",
      "Laisser mijoter 10 min, servir avec le riz.",
    ],
    ingredients: [
      { name: "Pois chiches", quantityG: 180 },
      { name: "Tofu ferme", quantityG: 100 },
      { name: "Épinards", quantityG: 100 },
      { name: "Riz", quantityG: 60 },
    ],
  },
  {
    title: "Wok de tofu, riz & brocoli",
    summary: "Sauté végétarien rapide et croquant.",
    mealType: MealType.MAIN,
    steps: [
      "Cuire le riz.",
      "Saisir le tofu à feu vif dans l'huile.",
      "Ajouter le brocoli et sauter 5 min.",
      "Déglacer à la sauce soja et servir sur le riz.",
    ],
    ingredients: [
      { name: "Tofu ferme", quantityG: 200 },
      { name: "Riz", quantityG: 75 },
      { name: "Brocoli", quantityG: 150 },
      { name: "Huile d'olive", quantityG: 10 },
    ],
  },

  // --- SNACK ---
  {
    title: "Skyr & fruits rouges",
    summary: "Collation protéinée en 30 secondes.",
    mealType: MealType.SNACK,
    steps: ["Verser le skyr dans un bol.", "Ajouter les fruits rouges."],
    ingredients: [
      { name: "Skyr", quantityG: 150 },
      { name: "Fruits rouges", quantityG: 80 },
    ],
  },
  {
    title: "Poignée d'amandes",
    summary: "L'en-cas de poche, gras sains et un peu de protéines.",
    mealType: MealType.SNACK,
    steps: ["Compter une petite poignée d'amandes."],
    ingredients: [{ name: "Amandes", quantityG: 30 }],
  },
  {
    title: "Tartine au beurre de cacahuète",
    summary: "Rapide, gourmand et rassasiant.",
    mealType: MealType.SNACK,
    steps: ["Toaster le pain complet.", "Étaler le beurre de cacahuète."],
    ingredients: [
      { name: "Pain complet", quantityG: 35 },
      { name: "Beurre de cacahuète", quantityG: 16 },
    ],
  },
  {
    title: "Œufs durs",
    summary: "Deux œufs durs : la collation protéinée nomade par excellence.",
    mealType: MealType.SNACK,
    steps: ["Cuire les œufs 9 min dans l'eau bouillante.", "Refroidir et écaler."],
    ingredients: [{ name: "Œuf", quantityG: 100 }],
  },
  {
    title: "Fromage blanc & miel",
    summary: "Douceur légère et protéinée.",
    mealType: MealType.SNACK,
    steps: ["Verser le fromage blanc.", "Napper d'un filet de miel."],
    ingredients: [
      { name: "Fromage blanc 0%", quantityG: 200 },
      { name: "Miel", quantityG: 20 },
    ],
  },
  {
    title: "Cottage cheese & fruits rouges",
    summary: "Frais, protéiné, peu sucré.",
    mealType: MealType.SNACK,
    steps: ["Verser le fromage cottage.", "Ajouter les fruits rouges."],
    ingredients: [
      { name: "Fromage cottage", quantityG: 150 },
      { name: "Fruits rouges", quantityG: 80 },
    ],
  },

  // --- BREAKFAST ---
  {
    title: "Porridge avoine, lait & banane",
    summary: "Le petit-déjeuner qui tient au corps toute la matinée.",
    mealType: MealType.BREAKFAST,
    steps: [
      "Chauffer les flocons d'avoine avec le lait 5 min.",
      "Ajouter la banane en rondelles.",
    ],
    ingredients: [
      { name: "Flocons d'avoine", quantityG: 60 },
      { name: "Lait demi-écrémé", quantityG: 200 },
      { name: "Banane", quantityG: 120 },
    ],
  },
  {
    title: "Bowl skyr, fruits rouges & chia",
    summary: "Bol frais et protéiné, prêt en 2 min.",
    mealType: MealType.BREAKFAST,
    steps: [
      "Verser le skyr dans un bol.",
      "Ajouter les fruits rouges et les graines de chia.",
    ],
    ingredients: [
      { name: "Skyr", quantityG: 200 },
      { name: "Fruits rouges", quantityG: 80 },
      { name: "Graines de chia", quantityG: 15 },
    ],
  },
  {
    title: "Omelette épinards & feta",
    summary: "Petit-déjeuner salé très protéiné pour bien démarrer.",
    mealType: MealType.BREAKFAST,
    steps: [
      "Battre les œufs et les blancs, saler et poivrer.",
      "Faire tomber les épinards à la poêle.",
      "Verser les œufs, émietter la feta et cuire à couvert 5 min.",
    ],
    ingredients: [
      { name: "Œuf", quantityG: 150 },
      { name: "Blanc d'œuf", quantityG: 100 },
      { name: "Épinards", quantityG: 80 },
      { name: "Feta", quantityG: 40 },
    ],
  },
  {
    title: "Tartines œufs brouillés & avocat",
    summary: "Le brunch express, gras sains et protéines.",
    mealType: MealType.BREAKFAST,
    steps: [
      "Brouiller les œufs à feu doux.",
      "Toaster le pain complet et écraser l'avocat dessus.",
      "Ajouter les œufs brouillés.",
    ],
    ingredients: [
      { name: "Œuf", quantityG: 150 },
      { name: "Pain complet", quantityG: 60 },
      { name: "Avocat", quantityG: 60 },
    ],
  },
  {
    title: "Porridge protéiné avoine & beurre de cacahuète",
    summary: "Version gourmande et plus protéinée du porridge.",
    mealType: MealType.BREAKFAST,
    steps: [
      "Chauffer les flocons d'avoine avec le lait 5 min.",
      "Incorporer le beurre de cacahuète.",
      "Ajouter la banane en rondelles.",
    ],
    ingredients: [
      { name: "Flocons d'avoine", quantityG: 60 },
      { name: "Lait demi-écrémé", quantityG: 200 },
      { name: "Beurre de cacahuète", quantityG: 20 },
      { name: "Banane", quantityG: 100 },
    ],
  },
];

// --- Seed logic ------------------------------------------------------------------

// Fail fast on a bad catalog. Both normalized names are UNIQUE columns, and an English
// name must never be ANOTHER ingredient's French name — lib/ai/tools.ts resolves French
// first, so one of the two rows would become unreachable. A cross-language collision is
// invisible in review (the two rows sit hundreds of lines apart, in different languages)
// and would silently give an ingredient the wrong category and protein value, which then
// propagates into every derived proteinPerServingG. Cheaper to catch here than to debug.
// NOTE: fr === en within ONE entry is fine and common (Parmesan, Quinoa) — two separate
// unique indexes, so it violates neither.
function assertCatalogIsResolvable() {
  const frIndexByKey = new Map<string, number>();
  const enIndexByKey = new Map<string, number>();

  INGREDIENTS.forEach((ing, index) => {
    const frKey = normalizeName(ing.fr);
    const enKey = normalizeName(ing.en);
    if (frIndexByKey.has(frKey)) {
      throw new Error(`Duplicate French ingredient name: "${ing.fr}".`);
    }
    if (enIndexByKey.has(enKey)) {
      const other = INGREDIENTS[enIndexByKey.get(enKey)!];
      throw new Error(
        `Duplicate English ingredient name "${ing.en}" ("${ing.fr}" and "${other.fr}").`,
      );
    }
    frIndexByKey.set(frKey, index);
    enIndexByKey.set(enKey, index);
  });

  for (const [key, index] of enIndexByKey) {
    const frIndex = frIndexByKey.get(key);
    if (frIndex !== undefined && frIndex !== index) {
      throw new Error(
        `English name "${INGREDIENTS[index].en}" is also the French name of "${INGREDIENTS[frIndex].fr}" — one of them would be unreachable. Rename one.`,
      );
    }
  }
}

async function main() {
  assertCatalogIsResolvable();

  // In-memory lookup by FRENCH name: SeedRecipe.ingredients[].name references the catalog
  // in French (it's a lookup key, not a display string).
  const ingredientByName = new Map(INGREDIENTS.map((ing) => [ing.fr, ing]));

  // 1. Upsert every ingredient by its French normalized name (the stable dedup key —
  //    French names never change, English ones were added on top). Additive + safe to
  //    re-run: refreshes the reference values without touching recipes or user data.
  for (const ing of INGREDIENTS) {
    const normalizedNameFr = normalizeName(ing.fr);
    const fields = {
      nameFr: ing.fr,
      nameEn: ing.en,
      normalizedNameEn: normalizeName(ing.en),
      category: ing.category,
      proteinPer100g: ing.proteinPer100g,
      defaultQuantityG: ing.defaultQuantityG,
      picto: ing.picto ?? null,
    };
    await prisma.ingredient.upsert({
      where: { normalizedNameFr },
      update: fields,
      create: { normalizedNameFr, ...fields },
    });
  }
  console.log(`Upserted ${INGREDIENTS.length} ingredients.`);

  // Map normalizedNameFr -> ingredient id, to link recipes.
  const ingredientRows = await prisma.ingredient.findMany({
    select: { id: true, normalizedNameFr: true },
  });
  const idByNormalized = new Map(
    ingredientRows.map((row) => [row.normalizedNameFr, row.id]),
  );

  // 2. Refresh the shared starter library (userId = null) IN PLACE, matched by title.
  //    We deliberately do NOT delete-and-recreate: BatchEntry.recipe is onDelete Cascade,
  //    so wiping a library recipe would silently remove it from users' saved batches.
  //    Updating keeps the recipe's id — batches keep pointing at it. User-owned recipes
  //    (userId != null) are untouched either way.
  const libraryRows = await prisma.recipe.findMany({
    where: { userId: null },
    select: { id: true, title: true },
  });
  const libraryIdByTitle = new Map(libraryRows.map((row) => [row.title, row.id]));

  let created = 0;
  let updated = 0;
  for (const recipe of RECIPES) {
    // Derive protein/part from the linked ingredients (never hardcoded).
    const proteinPerServingG = recipeProteinG(
      recipe.ingredients.map((link) => {
        const ing = ingredientByName.get(link.name);
        if (!ing) {
          throw new Error(
            `Recipe "${recipe.title}" references unknown ingredient "${link.name}".`,
          );
        }
        return { proteinPer100g: ing.proteinPer100g, quantityG: link.quantityG };
      }),
    );

    const links = recipe.ingredients.map((link) => {
      const ingredientId = idByNormalized.get(normalizeName(link.name));
      if (!ingredientId) {
        throw new Error(`Missing ingredient row for "${link.name}".`);
      }
      return { ingredientId, quantityG: link.quantityG };
    });

    const data = {
      title: recipe.title,
      summary: recipe.summary,
      steps: recipe.steps,
      mealType: recipe.mealType,
      imageUrl: recipe.imageUrl ?? null,
      proteinPerServingG,
    };

    const existingId = libraryIdByTitle.get(recipe.title);
    if (existingId) {
      // Replace the ingredient links only (they have no meaning outside the recipe),
      // then refresh the recipe's own fields. The recipe row — and its id — survives.
      await prisma.recipeIngredient.deleteMany({ where: { recipeId: existingId } });
      await prisma.recipe.update({
        where: { id: existingId },
        data: { ...data, ingredients: { create: links } },
      });
      updated++;
    } else {
      await prisma.recipe.create({
        data: { userId: null, ...data, ingredients: { create: links } },
      });
      created++;
    }
  }

  // Drop library recipes we no longer ship — but only those nobody placed in a batch,
  // mirroring the stale-ingredient guard below. A dropped recipe still sitting in a
  // user's batch is left alone rather than silently vanishing from it.
  const keptTitles = new Set(RECIPES.map((recipe) => recipe.title));
  const staleLibrary = await prisma.recipe.findMany({
    where: { userId: null, title: { notIn: [...keptTitles] } },
    select: { id: true, _count: { select: { batchEntries: true } } },
  });
  const removableIds = staleLibrary
    .filter((recipe) => recipe._count.batchEntries === 0)
    .map((recipe) => recipe.id);
  if (removableIds.length > 0) {
    await prisma.recipe.deleteMany({ where: { id: { in: removableIds } } });
  }

  console.log(
    `Recipes: library refreshed (${created} created, ${updated} updated, ${removableIds.length} removed).`,
  );

  // 3. Remove stale ingredients (renamed/dropped from the list) that nothing references
  //    anymore — keeps the locked catalog clean after a generalization pass (e.g. old
  //    "Champignons de Paris" → "Champignons"). Skips any still linked to a recipe
  //    (onDelete: Restrict), so it can never break existing data.
  const keep = new Set(INGREDIENTS.map((ing) => normalizeName(ing.fr)));
  const catalog = await prisma.ingredient.findMany({
    select: {
      id: true,
      normalizedNameFr: true,
      _count: { select: { recipeLinks: true } },
    },
  });
  const staleIds = catalog
    .filter((ing) => !keep.has(ing.normalizedNameFr) && ing._count.recipeLinks === 0)
    .map((ing) => ing.id);
  if (staleIds.length > 0) {
    await prisma.ingredient.deleteMany({ where: { id: { in: staleIds } } });
  }
  console.log(`Removed ${staleIds.length} stale ingredients.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
