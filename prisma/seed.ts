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
import { IngredientCategory, MealType } from "../lib/generated/prisma/enums";
import { normalizeName } from "../lib/ingredients";
import { recipeProteinG } from "../lib/nutrition";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// --- Data -----------------------------------------------------------------------

type SeedIngredient = {
  name: string;
  category: IngredientCategory;
  proteinPer100g: number;
  defaultQuantityG: number;
};

// ~130 common meal-prep / sport-nutrition ingredients across all categories. Since the
// chef and the manual form only ever pick from EXISTING ingredients (locked catalog),
// this base is deliberately broad. Names are kept GENERAL (e.g. "Champignons", not
// "Champignons de Paris") so one entry covers most recipes. proteinPer100g: plausible
// reference values (Ciqual/USDA-consistent), not lab-exact (see header note); raw /
// as-purchased convention.
const INGREDIENTS: SeedIngredient[] = [
  // MEAT — raw values
  { name: "Blanc de poulet", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 150 },
  { name: "Cuisse de poulet", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150 },
  { name: "Escalope de dinde", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 130 },
  { name: "Dinde hachée", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 125 },
  { name: "Steak haché 5% MG", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 125 },
  { name: "Bœuf", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150 },
  { name: "Porc", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150 },
  { name: "Veau", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150 },
  { name: "Agneau", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150 },
  { name: "Magret de canard", category: IngredientCategory.MEAT, proteinPer100g: 19, defaultQuantityG: 140 },
  { name: "Jambon blanc", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 50 },
  { name: "Jambon cru", category: IngredientCategory.MEAT, proteinPer100g: 27, defaultQuantityG: 40 },
  { name: "Lardons", category: IngredientCategory.MEAT, proteinPer100g: 15, defaultQuantityG: 40 },
  { name: "Saucisse", category: IngredientCategory.MEAT, proteinPer100g: 14, defaultQuantityG: 100 },

  // FISH & SEAFOOD — raw / canned-drained values
  { name: "Saumon", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { name: "Thon au naturel", category: IngredientCategory.FISH, proteinPer100g: 24, defaultQuantityG: 100 },
  { name: "Cabillaud", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { name: "Colin", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { name: "Truite", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { name: "Maquereau", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 100 },
  { name: "Sardines", category: IngredientCategory.FISH, proteinPer100g: 25, defaultQuantityG: 90 },
  { name: "Hareng", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 100 },
  { name: "Bar", category: IngredientCategory.FISH, proteinPer100g: 19, defaultQuantityG: 130 },
  { name: "Dorade", category: IngredientCategory.FISH, proteinPer100g: 19, defaultQuantityG: 130 },
  { name: "Sole", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { name: "Haddock", category: IngredientCategory.FISH, proteinPer100g: 23, defaultQuantityG: 120 },
  { name: "Crevettes", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 100 },
  { name: "Moules", category: IngredientCategory.FISH, proteinPer100g: 12, defaultQuantityG: 150 },
  { name: "Calamar", category: IngredientCategory.FISH, proteinPer100g: 16, defaultQuantityG: 120 },
  { name: "Surimi", category: IngredientCategory.FISH, proteinPer100g: 8, defaultQuantityG: 80 },

  // DAIRY_EGG
  { name: "Œuf", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 13, defaultQuantityG: 100 },
  { name: "Blanc d'œuf", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 100 },
  { name: "Skyr", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 150 },
  { name: "Yaourt grec", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 10, defaultQuantityG: 150 },
  { name: "Yaourt nature", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 4, defaultQuantityG: 125 },
  { name: "Fromage blanc 0%", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 8, defaultQuantityG: 150 },
  { name: "Fromage cottage", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 100 },
  { name: "Petit-suisse", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 9, defaultQuantityG: 60 },
  { name: "Feta", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 14, defaultQuantityG: 40 },
  { name: "Mozzarella", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 18, defaultQuantityG: 60 },
  { name: "Chèvre", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 19, defaultQuantityG: 40 },
  { name: "Ricotta", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 8, defaultQuantityG: 60 },
  { name: "Parmesan", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 35, defaultQuantityG: 15 },
  { name: "Emmental", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 28, defaultQuantityG: 30 },
  { name: "Comté", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 27, defaultQuantityG: 30 },
  { name: "Lait demi-écrémé", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 3, defaultQuantityG: 200 },

  // STARCH — dry / raw values
  { name: "Riz", category: IngredientCategory.STARCH, proteinPer100g: 7, defaultQuantityG: 75 },
  { name: "Riz complet", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 75 },
  { name: "Pâtes", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 80 },
  { name: "Pâtes complètes", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 80 },
  { name: "Semoule", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 70 },
  { name: "Boulgour", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 70 },
  { name: "Quinoa", category: IngredientCategory.STARCH, proteinPer100g: 14, defaultQuantityG: 60 },
  { name: "Sarrasin", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 60 },
  { name: "Pomme de terre", category: IngredientCategory.STARCH, proteinPer100g: 2, defaultQuantityG: 200 },
  { name: "Patate douce", category: IngredientCategory.STARCH, proteinPer100g: 2, defaultQuantityG: 200 },
  { name: "Flocons d'avoine", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 60 },
  { name: "Muesli", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 60 },
  { name: "Pain complet", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60 },
  { name: "Pain", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60 },
  { name: "Pain de mie", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 50 },
  { name: "Tortilla", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60 },
  { name: "Polenta", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60 },

  // VEGETABLE
  { name: "Brocoli", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 150 },
  { name: "Épinards", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100 },
  { name: "Haricots verts", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150 },
  { name: "Courgette", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150 },
  { name: "Carotte", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Champignons", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100 },
  { name: "Chou-fleur", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150 },
  { name: "Chou", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.3, defaultQuantityG: 150 },
  { name: "Chou de Bruxelles", category: IngredientCategory.VEGETABLE, proteinPer100g: 3.4, defaultQuantityG: 150 },
  { name: "Aubergine", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150 },
  { name: "Tomate", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Poivron", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Oignon", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 60 },
  { name: "Ail", category: IngredientCategory.VEGETABLE, proteinPer100g: 6, defaultQuantityG: 5 },
  { name: "Concombre", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Salade verte", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 50 },
  { name: "Roquette", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.6, defaultQuantityG: 40 },
  { name: "Maïs", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 80 },
  { name: "Petits pois", category: IngredientCategory.VEGETABLE, proteinPer100g: 5, defaultQuantityG: 100 },
  { name: "Betterave", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.6, defaultQuantityG: 100 },
  { name: "Courge", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150 },
  { name: "Poireau", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.5, defaultQuantityG: 100 },
  { name: "Fenouil", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 100 },
  { name: "Asperge", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.2, defaultQuantityG: 120 },
  { name: "Artichaut", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100 },
  { name: "Endive", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Radis", category: IngredientCategory.VEGETABLE, proteinPer100g: 0.7, defaultQuantityG: 60 },
  { name: "Avocat", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 100 },

  // FRUIT
  { name: "Banane", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 120 },
  { name: "Pomme", category: IngredientCategory.FRUIT, proteinPer100g: 0.3, defaultQuantityG: 150 },
  { name: "Poire", category: IngredientCategory.FRUIT, proteinPer100g: 0.4, defaultQuantityG: 150 },
  { name: "Fruits rouges", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Fraise", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 120 },
  { name: "Framboise", category: IngredientCategory.FRUIT, proteinPer100g: 1.2, defaultQuantityG: 100 },
  { name: "Myrtille", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100 },
  { name: "Orange", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 150 },
  { name: "Clémentine", category: IngredientCategory.FRUIT, proteinPer100g: 0.9, defaultQuantityG: 80 },
  { name: "Citron", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 30 },
  { name: "Pamplemousse", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 200 },
  { name: "Kiwi", category: IngredientCategory.FRUIT, proteinPer100g: 1.1, defaultQuantityG: 100 },
  { name: "Mangue", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 120 },
  { name: "Ananas", category: IngredientCategory.FRUIT, proteinPer100g: 0.5, defaultQuantityG: 120 },
  { name: "Raisin", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100 },
  { name: "Pêche", category: IngredientCategory.FRUIT, proteinPer100g: 0.9, defaultQuantityG: 120 },
  { name: "Abricot", category: IngredientCategory.FRUIT, proteinPer100g: 1.4, defaultQuantityG: 100 },
  { name: "Prune", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100 },
  { name: "Cerise", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 100 },
  { name: "Pastèque", category: IngredientCategory.FRUIT, proteinPer100g: 0.6, defaultQuantityG: 200 },
  { name: "Melon", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 200 },
  { name: "Figue", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 100 },
  { name: "Grenade", category: IngredientCategory.FRUIT, proteinPer100g: 1.7, defaultQuantityG: 100 },
  { name: "Datte", category: IngredientCategory.FRUIT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { name: "Raisins secs", category: IngredientCategory.FRUIT, proteinPer100g: 3, defaultQuantityG: 30 },
  { name: "Compote de pomme", category: IngredientCategory.FRUIT, proteinPer100g: 0.3, defaultQuantityG: 100 },

  // NUTS_SEEDS
  { name: "Amandes", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 30 },
  { name: "Noix", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 15, defaultQuantityG: 30 },
  { name: "Noix de cajou", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 30 },
  { name: "Noisettes", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 15, defaultQuantityG: 30 },
  { name: "Pistaches", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 20, defaultQuantityG: 30 },
  { name: "Cacahuètes", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 26, defaultQuantityG: 30 },
  { name: "Beurre de cacahuète", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 25, defaultQuantityG: 20 },
  { name: "Purée d'amande", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 20 },
  { name: "Graines de chia", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 17, defaultQuantityG: 15 },
  { name: "Graines de courge", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 30, defaultQuantityG: 15 },
  { name: "Graines de lin", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 15 },
  { name: "Graines de tournesol", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 15 },
  { name: "Graines de sésame", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 10 },

  // LEGUME — cooked / canned-drained values (how they're used in a recipe)
  { name: "Lentilles", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150 },
  { name: "Lentilles corail", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150 },
  { name: "Pois chiches", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150 },
  { name: "Haricots rouges", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150 },
  { name: "Haricots blancs", category: IngredientCategory.LEGUME, proteinPer100g: 7, defaultQuantityG: 150 },
  { name: "Haricots noirs", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150 },
  { name: "Flageolets", category: IngredientCategory.LEGUME, proteinPer100g: 7, defaultQuantityG: 150 },
  { name: "Fèves", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 120 },
  { name: "Pois cassés", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150 },
  { name: "Edamame", category: IngredientCategory.LEGUME, proteinPer100g: 11, defaultQuantityG: 100 },
  { name: "Tofu ferme", category: IngredientCategory.LEGUME, proteinPer100g: 15, defaultQuantityG: 150 },
  { name: "Tempeh", category: IngredientCategory.LEGUME, proteinPer100g: 19, defaultQuantityG: 120 },
  { name: "Houmous", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 40 },

  // CONDIMENT — basics assumed on hand; near-zero protein, small quantities
  { name: "Huile d'olive", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { name: "Beurre", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 10 },
  { name: "Crème fraîche", category: IngredientCategory.CONDIMENT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { name: "Sel", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2 },
  { name: "Poivre", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1 },
  { name: "Épices", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { name: "Sauce soja", category: IngredientCategory.CONDIMENT, proteinPer100g: 8, defaultQuantityG: 15 },
  { name: "Moutarde", category: IngredientCategory.CONDIMENT, proteinPer100g: 5, defaultQuantityG: 10 },
  { name: "Vinaigre", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { name: "Ketchup", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 15 },
  { name: "Mayonnaise", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 15 },
  { name: "Pesto", category: IngredientCategory.CONDIMENT, proteinPer100g: 4, defaultQuantityG: 20 },
  { name: "Sauce tomate", category: IngredientCategory.CONDIMENT, proteinPer100g: 1.5, defaultQuantityG: 100 },
  { name: "Miel", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 20 },
];

// Per-ingredient emoji (keyed by name). Ingredients absent here fall back to their category
// picto at render time — so we only list the ones with a distinct, better-fitting emoji.
const PICTO_BY_NAME: Record<string, string> = {
  // MEAT
  "Blanc de poulet": "🍗",
  "Cuisse de poulet": "🍗",
  "Escalope de dinde": "🦃",
  "Dinde hachée": "🦃",
  "Steak haché 5% MG": "🥩",
  Bœuf: "🥩",
  Porc: "🐖",
  Veau: "🥩",
  Agneau: "🐑",
  "Magret de canard": "🦆",
  "Jambon blanc": "🍖",
  "Jambon cru": "🍖",
  Lardons: "🥓",
  Saucisse: "🌭",
  // FISH & SEAFOOD (finfish keep the 🐟 category picto)
  Crevettes: "🦐",
  Moules: "🦪",
  Calamar: "🦑",
  Surimi: "🦀",
  // DAIRY_EGG
  Œuf: "🥚",
  "Blanc d'œuf": "🥚",
  Skyr: "🥛",
  "Yaourt grec": "🥛",
  "Yaourt nature": "🥛",
  "Fromage blanc 0%": "🥛",
  "Fromage cottage": "🧀",
  "Petit-suisse": "🥛",
  Feta: "🧀",
  Mozzarella: "🧀",
  Chèvre: "🧀",
  Ricotta: "🧀",
  Parmesan: "🧀",
  Emmental: "🧀",
  Comté: "🧀",
  "Lait demi-écrémé": "🥛",
  // STARCH
  Pâtes: "🍝",
  "Pâtes complètes": "🍝",
  Semoule: "🍚",
  Boulgour: "🌾",
  Quinoa: "🌾",
  Sarrasin: "🌾",
  "Pomme de terre": "🥔",
  "Patate douce": "🍠",
  "Flocons d'avoine": "🥣",
  Muesli: "🥣",
  "Pain complet": "🍞",
  Pain: "🍞",
  "Pain de mie": "🍞",
  Tortilla: "🌯",
  Polenta: "🌽",
  // VEGETABLE
  Épinards: "🥬",
  Courgette: "🥒",
  Carotte: "🥕",
  Champignons: "🍄",
  Chou: "🥬",
  "Chou de Bruxelles": "🥬",
  Aubergine: "🍆",
  Tomate: "🍅",
  Poivron: "🫑",
  Oignon: "🧅",
  Ail: "🧄",
  Concombre: "🥒",
  "Salade verte": "🥬",
  Roquette: "🥬",
  Maïs: "🌽",
  "Petits pois": "🫛",
  Courge: "🎃",
  Poireau: "🥬",
  Avocat: "🥑",
  "Haricots verts": "🫛",
  // FRUIT
  Banane: "🍌",
  Pomme: "🍎",
  Poire: "🍐",
  "Fruits rouges": "🫐",
  Fraise: "🍓",
  Framboise: "🍓",
  Myrtille: "🫐",
  Orange: "🍊",
  Clémentine: "🍊",
  Citron: "🍋",
  Pamplemousse: "🍊",
  Kiwi: "🥝",
  Mangue: "🥭",
  Ananas: "🍍",
  Raisin: "🍇",
  "Raisins secs": "🍇",
  Pêche: "🍑",
  Abricot: "🍑",
  Cerise: "🍒",
  Pastèque: "🍉",
  Melon: "🍈",
  "Compote de pomme": "🍎",
  // NUTS_SEEDS
  Amandes: "🌰",
  Noix: "🌰",
  Noisettes: "🌰",
  "Noix de cajou": "🥜",
  Pistaches: "🥜",
  Cacahuètes: "🥜",
  "Beurre de cacahuète": "🥜",
  "Purée d'amande": "🥜",
  // LEGUME
  Edamame: "🫛",
  // CONDIMENT
  "Huile d'olive": "🫒",
  Beurre: "🧈",
  Sel: "🧂",
  Épices: "🌶️",
  "Sauce soja": "🍶",
  "Sauce tomate": "🥫",
  Ketchup: "🥫",
  Miel: "🍯",
};

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

async function main() {
  // In-memory lookup by name so we can compute protein/part without extra queries.
  const ingredientByName = new Map(INGREDIENTS.map((ing) => [ing.name, ing]));

  // 1. Upsert every ingredient by its normalizedName (dedup key). Additive + safe to
  //    re-run: refreshes the reference values without touching recipes or user data.
  for (const ing of INGREDIENTS) {
    const normalizedName = normalizeName(ing.name);
    const picto = PICTO_BY_NAME[ing.name] ?? null;
    await prisma.ingredient.upsert({
      where: { normalizedName },
      update: {
        name: ing.name,
        category: ing.category,
        proteinPer100g: ing.proteinPer100g,
        defaultQuantityG: ing.defaultQuantityG,
        picto,
      },
      create: {
        name: ing.name,
        normalizedName,
        category: ing.category,
        proteinPer100g: ing.proteinPer100g,
        defaultQuantityG: ing.defaultQuantityG,
        picto,
      },
    });
  }
  console.log(`Upserted ${INGREDIENTS.length} ingredients.`);

  // Map normalizedName -> ingredient id, to link recipes.
  const ingredientRows = await prisma.ingredient.findMany({
    select: { id: true, normalizedName: true },
  });
  const idByNormalized = new Map(
    ingredientRows.map((row) => [row.normalizedName, row.id]),
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
  const keep = new Set(INGREDIENTS.map((ing) => normalizeName(ing.name)));
  const catalog = await prisma.ingredient.findMany({
    select: { id: true, normalizedName: true, _count: { select: { recipeLinks: true } } },
  });
  const staleIds = catalog
    .filter((ing) => !keep.has(ing.normalizedName) && ing._count.recipeLinks === 0)
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
