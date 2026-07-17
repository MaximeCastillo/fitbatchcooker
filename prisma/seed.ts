// Seed script — a few healthy, high-protein recipes so the library is never empty.
// Run with: npx tsx prisma/seed.ts
// Idempotent: skips if recipes already exist (won't wipe user data).
import "dotenv/config";
import { PrismaClient } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const recipes = [
  {
    title: "Poulet rôti & patates douces",
    summary: "Le classique du batch cooking : simple, rassasiant, riche en protéines.",
    steps: [
      "Préchauffer le four à 200°C.",
      "Couper les patates douces en cubes, assaisonner et enfourner 25 min.",
      "Assaisonner les cuisses de poulet et les rôtir 30 min avec les patates.",
      "Ajouter une poignée de brocolis 10 min avant la fin.",
    ],
    servings: 2,
    proteinPerServingG: 45,
    caloriesPerServingKcal: 620,
    category: "poulet",
  },
  {
    title: "Bol de riz, saumon & brocoli",
    summary: "Oméga-3 et protéines, prêt en 20 min, parfait à emporter.",
    steps: [
      "Cuire le riz complet selon les instructions du paquet.",
      "Saisir le pavé de saumon 4 min de chaque côté.",
      "Cuire le brocoli à la vapeur 6 min.",
      "Assembler le bol, arroser de sauce soja et de graines de sésame.",
    ],
    servings: 2,
    proteinPerServingG: 38,
    caloriesPerServingKcal: 540,
    category: "poisson",
  },
  {
    title: "Chili de dinde aux haricots rouges",
    summary: "Mijoté protéiné et plein de légumes, encore meilleur réchauffé.",
    steps: [
      "Faire revenir oignon, ail et poivron.",
      "Ajouter la dinde hachée et faire dorer.",
      "Incorporer tomates concassées, haricots rouges et épices.",
      "Laisser mijoter 25 min à feu doux.",
    ],
    servings: 4,
    proteinPerServingG: 40,
    caloriesPerServingKcal: 480,
    category: "boeuf",
  },
  {
    title: "Omelette épinards, feta & pois chiches",
    summary: "Un petit-déjeuner ou dîner express, très protéiné.",
    steps: [
      "Battre les oeufs avec sel et poivre.",
      "Faire tomber les épinards à la poêle.",
      "Ajouter les pois chiches et la feta émiettée.",
      "Verser les oeufs et cuire à couvert 5 min.",
    ],
    servings: 1,
    proteinPerServingG: 32,
    caloriesPerServingKcal: 410,
    category: "vegetarien",
  },
];

async function main() {
  const existing = await prisma.recipe.count();
  if (existing > 0) {
    console.log(`Seed skipped: ${existing} recipe(s) already present.`);
    return;
  }
  await prisma.recipe.createMany({ data: recipes });
  console.log(`Seeded ${recipes.length} recipes.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
