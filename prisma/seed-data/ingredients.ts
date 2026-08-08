// The shared, LOCKED ingredient catalog — bilingual (français / English).
//
// Why bilingual: the chef answers in the user's language, so it proposes ingredient names
// in that language. With a French-only catalog, an English "Olive oil" never matched
// "Huile d'olive" and create_recipe rejected it even though the row existed. Both names
// are therefore stored and BOTH are searched (see lib/ai/tools.ts).
//
// Conventions
// - `proteinPer100g` is "à la louche" (PRINCIPLES §1: régularité > précision), consistent
//   with USDA/Ciqual but rounded. Integers at >= 5 g, at most ONE decimal below.
//   Same family ⇒ same value (all white fish 18) — per-item micro-variation is noise the
//   gauge rounds away anyway.
// - The weighing convention differs per category and is stated in each banner below.
// - `defaultQuantityG` = a realistic amount FOR ONE PART.
// - `picto` is optional: set it only when a distinct emoji genuinely fits, otherwise the
//   category emoji is used at render time (ingredientPicto() in lib/ingredients.ts).
//
// English naming rules
// - American English, supermarket register (Zucchini, Eggplant, Arugula, Cilantro).
// - Sentence case. Plural when the thing is counted (Almonds, Chickpeas, all seeds),
//   singular otherwise. FR and EN need NOT agree in number: "Épinards" → "Spinach".
// - No English equivalent ⇒ keep the French word (fr === en): Petit-suisse, Comté.
//   Accents never affect matching (normalizeName strips them), so they are cosmetic.
// - FALSE FRIENDS, non-negotiable — breaking these makes an ingredient unreachable:
//   Raisin→Grapes / Raisins secs→Raisins · Prune→Plum / Pruneaux→Prunes ·
//   Poivre→Black pepper / Poivron→Bell pepper (never a bare "Pepper") ·
//   Bar→Sea bass · Haddock→Smoked haddock. Exactly ONE row may own "Cream", "Tuna",
//   "Yeast", "Butter". The seed refuses to run if these rules are violated.
//
// One entry per line so a diff stays reviewable. Order is curation order (the UI sorts at
// query time), grouped by category then by sub-block.
import { IngredientCategory } from "../../lib/generated/prisma/enums";

export type SeedIngredient = {
  fr: string;
  en: string;
  category: IngredientCategory;
  proteinPer100g: number;
  defaultQuantityG: number;
  picto?: string;
};

export const INGREDIENTS: SeedIngredient[] = [
  // ══ MEAT ══ cru / tel qu'acheté. Viande fraîche jamais > 25 ; le haut de la fourchette
  //           (27-33) est réservé aux salaisons.
  // ── Volaille
  { fr: "Blanc de poulet", en: "Chicken breast", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 150, picto: "🍗" },
  { fr: "Cuisse de poulet", en: "Chicken thigh", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150, picto: "🍗" },
  { fr: "Aile de poulet", en: "Chicken wing", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150, picto: "🍗" },
  { fr: "Poulet haché", en: "Ground chicken", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 125, picto: "🍗" },
  { fr: "Poulet rôti", en: "Rotisserie chicken", category: IngredientCategory.MEAT, proteinPer100g: 25, defaultQuantityG: 150, picto: "🍗" },
  { fr: "Poulet fumé", en: "Smoked chicken", category: IngredientCategory.MEAT, proteinPer100g: 24, defaultQuantityG: 100, picto: "🍗" },
  { fr: "Escalope de dinde", en: "Turkey cutlet", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 130, picto: "🦃" },
  { fr: "Dinde hachée", en: "Ground turkey", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 125, picto: "🦃" },
  { fr: "Pintade", en: "Guinea fowl", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 150, picto: "🍗" },
  { fr: "Canard", en: "Duck", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150, picto: "🦆" },
  { fr: "Magret de canard", en: "Duck breast", category: IngredientCategory.MEAT, proteinPer100g: 19, defaultQuantityG: 140, picto: "🦆" },
  { fr: "Foie de volaille", en: "Chicken liver", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 100 },
  { fr: "Lapin", en: "Rabbit", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 150 },
  // ── Bœuf & veau
  { fr: "Bœuf", en: "Beef", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150, picto: "🥩" },
  { fr: "Steak haché 5% MG", en: "Ground beef 5%", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 125, picto: "🥩" },
  { fr: "Steak haché 15% MG", en: "Ground beef 15%", category: IngredientCategory.MEAT, proteinPer100g: 19, defaultQuantityG: 125, picto: "🥩" },
  { fr: "Bavette", en: "Flank steak", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150, picto: "🥩" },
  { fr: "Entrecôte", en: "Ribeye", category: IngredientCategory.MEAT, proteinPer100g: 19, defaultQuantityG: 180, picto: "🥩" },
  { fr: "Rumsteck", en: "Rump steak", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 150, picto: "🥩" },
  { fr: "Rôti de bœuf", en: "Roast beef", category: IngredientCategory.MEAT, proteinPer100g: 22, defaultQuantityG: 150, picto: "🥩" },
  { fr: "Bœuf à braiser", en: "Braising beef", category: IngredientCategory.MEAT, proteinPer100g: 20, defaultQuantityG: 150, picto: "🥩" },
  { fr: "Veau", en: "Veal", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150, picto: "🥩" },
  // ── Porc & agneau
  { fr: "Porc", en: "Pork", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150, picto: "🐖" },
  { fr: "Filet mignon de porc", en: "Pork tenderloin", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 140, picto: "🐖" },
  { fr: "Côte de porc", en: "Pork chop", category: IngredientCategory.MEAT, proteinPer100g: 21, defaultQuantityG: 150, picto: "🐖" },
  { fr: "Échine de porc", en: "Pork shoulder", category: IngredientCategory.MEAT, proteinPer100g: 19, defaultQuantityG: 150, picto: "🐖" },
  { fr: "Agneau", en: "Lamb", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150, picto: "🐑" },
  { fr: "Gigot d'agneau", en: "Leg of lamb", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 150, picto: "🐑" },
  { fr: "Côtelette d'agneau", en: "Lamb chop", category: IngredientCategory.MEAT, proteinPer100g: 17, defaultQuantityG: 140, picto: "🐑" },
  // ── Charcuterie & salaisons
  { fr: "Jambon blanc", en: "Cooked ham", category: IngredientCategory.MEAT, proteinPer100g: 18, defaultQuantityG: 50, picto: "🍖" },
  { fr: "Jambon cru", en: "Cured ham", category: IngredientCategory.MEAT, proteinPer100g: 27, defaultQuantityG: 40, picto: "🍖" },
  { fr: "Viande des Grisons", en: "Bresaola", category: IngredientCategory.MEAT, proteinPer100g: 33, defaultQuantityG: 40, picto: "🍖" },
  { fr: "Lardons", en: "Bacon", category: IngredientCategory.MEAT, proteinPer100g: 15, defaultQuantityG: 40, picto: "🥓" },
  { fr: "Poitrine fumée", en: "Smoked pork belly", category: IngredientCategory.MEAT, proteinPer100g: 15, defaultQuantityG: 40, picto: "🥓" },
  { fr: "Saucisse", en: "Sausage", category: IngredientCategory.MEAT, proteinPer100g: 14, defaultQuantityG: 100, picto: "🌭" },
  { fr: "Chorizo", en: "Chorizo", category: IngredientCategory.MEAT, proteinPer100g: 24, defaultQuantityG: 40, picto: "🌭" },
  { fr: "Merguez", en: "Merguez", category: IngredientCategory.MEAT, proteinPer100g: 15, defaultQuantityG: 100, picto: "🌭" },
  { fr: "Saucisson sec", en: "Dry sausage", category: IngredientCategory.MEAT, proteinPer100g: 26, defaultQuantityG: 30, picto: "🌭" },
  { fr: "Boudin noir", en: "Blood sausage", category: IngredientCategory.MEAT, proteinPer100g: 14, defaultQuantityG: 100, picto: "🌭" },

  // ══ FISH ══ cru / conserve égouttée. Poissons blancs tous à 18.
  // ── Poissons gras
  { fr: "Saumon", en: "Salmon", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { fr: "Saumon fumé", en: "Smoked salmon", category: IngredientCategory.FISH, proteinPer100g: 22, defaultQuantityG: 80 },
  { fr: "Truite", en: "Trout", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { fr: "Truite fumée", en: "Smoked trout", category: IngredientCategory.FISH, proteinPer100g: 22, defaultQuantityG: 80 },
  { fr: "Maquereau", en: "Mackerel", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 100 },
  { fr: "Sardines", en: "Sardines", category: IngredientCategory.FISH, proteinPer100g: 25, defaultQuantityG: 90 },
  { fr: "Hareng", en: "Herring", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 100 },
  { fr: "Anchois", en: "Anchovies", category: IngredientCategory.FISH, proteinPer100g: 26, defaultQuantityG: 20 },
  { fr: "Thon au naturel", en: "Canned tuna", category: IngredientCategory.FISH, proteinPer100g: 24, defaultQuantityG: 100, picto: "🥫" },
  { fr: "Thon frais", en: "Tuna steak", category: IngredientCategory.FISH, proteinPer100g: 24, defaultQuantityG: 130 },
  { fr: "Espadon", en: "Swordfish", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  // ── Poissons blancs
  { fr: "Cabillaud", en: "Cod", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Colin", en: "Pollock", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Lieu noir", en: "Saithe", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Merlan", en: "Whiting", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Julienne", en: "Ling", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Bar", en: "Sea bass", category: IngredientCategory.FISH, proteinPer100g: 19, defaultQuantityG: 130 },
  { fr: "Dorade", en: "Sea bream", category: IngredientCategory.FISH, proteinPer100g: 19, defaultQuantityG: 130 },
  { fr: "Sole", en: "Sole", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 130 },
  { fr: "Limande", en: "Dab", category: IngredientCategory.FISH, proteinPer100g: 17, defaultQuantityG: 130 },
  { fr: "Lotte", en: "Monkfish", category: IngredientCategory.FISH, proteinPer100g: 17, defaultQuantityG: 130 },
  { fr: "Flétan", en: "Halibut", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { fr: "Rouget", en: "Red mullet", category: IngredientCategory.FISH, proteinPer100g: 19, defaultQuantityG: 120 },
  { fr: "Raie", en: "Skate", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 130 },
  { fr: "Haddock", en: "Smoked haddock", category: IngredientCategory.FISH, proteinPer100g: 23, defaultQuantityG: 120 },
  { fr: "Poisson pané", en: "Breaded fish", category: IngredientCategory.FISH, proteinPer100g: 12, defaultQuantityG: 120 },
  // ── Fruits de mer
  { fr: "Crevettes", en: "Shrimp", category: IngredientCategory.FISH, proteinPer100g: 20, defaultQuantityG: 100, picto: "🦐" },
  { fr: "Moules", en: "Mussels", category: IngredientCategory.FISH, proteinPer100g: 12, defaultQuantityG: 150, picto: "🦪" },
  { fr: "Palourdes", en: "Clams", category: IngredientCategory.FISH, proteinPer100g: 12, defaultQuantityG: 150, picto: "🦪" },
  { fr: "Noix de Saint-Jacques", en: "Scallops", category: IngredientCategory.FISH, proteinPer100g: 17, defaultQuantityG: 100, picto: "🦪" },
  { fr: "Calamar", en: "Squid", category: IngredientCategory.FISH, proteinPer100g: 16, defaultQuantityG: 120, picto: "🦑" },
  { fr: "Poulpe", en: "Octopus", category: IngredientCategory.FISH, proteinPer100g: 16, defaultQuantityG: 120, picto: "🦑" },
  { fr: "Crabe", en: "Crab", category: IngredientCategory.FISH, proteinPer100g: 18, defaultQuantityG: 100, picto: "🦀" },
  { fr: "Surimi", en: "Surimi", category: IngredientCategory.FISH, proteinPer100g: 8, defaultQuantityG: 80, picto: "🦀" },

  // ══ DAIRY_EGG ══ tel que vendu. Lait 3-4 · yaourts 4-11 · frais 7-14 · pâte molle 15-21
  //                · pâte pressée 23-28 · pâte dure 26-35.
  // ── Œufs
  { fr: "Œuf", en: "Egg", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 13, defaultQuantityG: 100, picto: "🥚" },
  { fr: "Blanc d'œuf", en: "Egg white", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 100, picto: "🥚" },
  { fr: "Jaune d'œuf", en: "Egg yolk", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 16, defaultQuantityG: 35, picto: "🥚" },
  // ── Laits & yaourts
  { fr: "Lait demi-écrémé", en: "Semi-skimmed milk", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 3, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Lait entier", en: "Whole milk", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 3, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Lait écrémé", en: "Skim milk", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 3, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Kéfir", en: "Kefir", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 3, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Skyr", en: "Skyr", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 150, picto: "🥛" },
  { fr: "Yaourt grec", en: "Greek yogurt", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 10, defaultQuantityG: 150, picto: "🥛" },
  { fr: "Yaourt nature", en: "Plain yogurt", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 4, defaultQuantityG: 125, picto: "🥛" },
  { fr: "Yaourt de brebis", en: "Sheep yogurt", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 5, defaultQuantityG: 125, picto: "🥛" },
  // ── Fromages frais
  { fr: "Fromage blanc 0%", en: "Quark 0%", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 8, defaultQuantityG: 150, picto: "🥛" },
  { fr: "Fromage cottage", en: "Cottage cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 11, defaultQuantityG: 100, picto: "🧀" },
  { fr: "Petit-suisse", en: "Petit-suisse", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 9, defaultQuantityG: 60, picto: "🥛" },
  { fr: "Faisselle", en: "Fresh curd cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 7, defaultQuantityG: 100, picto: "🥛" },
  { fr: "Fromage frais", en: "Cream cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 7, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Ricotta", en: "Ricotta", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 8, defaultQuantityG: 60, picto: "🧀" },
  { fr: "Mascarpone", en: "Mascarpone", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 4, defaultQuantityG: 30, picto: "🧀" },
  // ── Pâtes molles & persillés
  { fr: "Mozzarella", en: "Mozzarella", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 18, defaultQuantityG: 60, picto: "🧀" },
  { fr: "Burrata", en: "Burrata", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 15, defaultQuantityG: 60, picto: "🧀" },
  { fr: "Feta", en: "Feta", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 14, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Chèvre", en: "Goat cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 19, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Camembert", en: "Camembert", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 20, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Brie", en: "Brie", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 19, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Munster", en: "Munster", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 19, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Reblochon", en: "Reblochon", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 20, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Roquefort", en: "Roquefort", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 19, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Bleu", en: "Blue cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 21, defaultQuantityG: 30, picto: "🧀" },
  // ── Pâtes pressées & dures
  { fr: "Halloumi", en: "Halloumi", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 22, defaultQuantityG: 60, picto: "🧀" },
  { fr: "Raclette", en: "Raclette cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 23, defaultQuantityG: 40, picto: "🧀" },
  { fr: "Cheddar", en: "Cheddar", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 25, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Gouda", en: "Gouda", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 25, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Fromage de brebis", en: "Sheep cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 25, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Tomme", en: "Tomme", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 26, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Beaufort", en: "Beaufort", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 26, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Comté", en: "Comté", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 27, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Gruyère", en: "Gruyère", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 27, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Emmental", en: "Emmental", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 28, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Fromage râpé", en: "Shredded cheese", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 26, defaultQuantityG: 30, picto: "🧀" },
  { fr: "Parmesan", en: "Parmesan", category: IngredientCategory.DAIRY_EGG, proteinPer100g: 35, defaultQuantityG: 15, picto: "🧀" },

  // ══ STARCH ══ sec / cru pour les céréales, pâtes, flocons ; TEL QUE MANGÉ pour pain,
  //             pomme de terre, gnocchis (seule catégorie à deux conventions).
  // ── Riz
  { fr: "Riz", en: "Rice", category: IngredientCategory.STARCH, proteinPer100g: 7, defaultQuantityG: 75 },
  { fr: "Riz complet", en: "Brown rice", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 75 },
  { fr: "Riz basmati", en: "Basmati rice", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 75 },
  { fr: "Riz thaï", en: "Jasmine rice", category: IngredientCategory.STARCH, proteinPer100g: 7, defaultQuantityG: 75 },
  { fr: "Riz arborio", en: "Arborio rice", category: IngredientCategory.STARCH, proteinPer100g: 7, defaultQuantityG: 75 },
  { fr: "Riz sauvage", en: "Wild rice", category: IngredientCategory.STARCH, proteinPer100g: 14, defaultQuantityG: 60 },
  // ── Pâtes & nouilles
  { fr: "Pâtes", en: "Pasta", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 80, picto: "🍝" },
  { fr: "Pâtes complètes", en: "Whole wheat pasta", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 80, picto: "🍝" },
  { fr: "Lasagnes", en: "Lasagna sheets", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 80, picto: "🍝" },
  { fr: "Nouilles de riz", en: "Rice noodles", category: IngredientCategory.STARCH, proteinPer100g: 6, defaultQuantityG: 70, picto: "🍜" },
  { fr: "Nouilles soba", en: "Soba noodles", category: IngredientCategory.STARCH, proteinPer100g: 14, defaultQuantityG: 70, picto: "🍜" },
  { fr: "Nouilles udon", en: "Udon noodles", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 80, picto: "🍜" },
  { fr: "Vermicelles", en: "Vermicelli", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 70, picto: "🍜" },
  { fr: "Gnocchis", en: "Gnocchi", category: IngredientCategory.STARCH, proteinPer100g: 4, defaultQuantityG: 200 },
  // ── Céréales & graines
  { fr: "Semoule", en: "Couscous", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 70, picto: "🍚" },
  { fr: "Boulgour", en: "Bulgur", category: IngredientCategory.STARCH, proteinPer100g: 12, defaultQuantityG: 70, picto: "🌾" },
  { fr: "Quinoa", en: "Quinoa", category: IngredientCategory.STARCH, proteinPer100g: 14, defaultQuantityG: 60, picto: "🌾" },
  { fr: "Sarrasin", en: "Buckwheat", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 60, picto: "🌾" },
  { fr: "Épeautre", en: "Spelt", category: IngredientCategory.STARCH, proteinPer100g: 14, defaultQuantityG: 60, picto: "🌾" },
  { fr: "Orge perlé", en: "Pearl barley", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 60, picto: "🌾" },
  { fr: "Millet", en: "Millet", category: IngredientCategory.STARCH, proteinPer100g: 11, defaultQuantityG: 60, picto: "🌾" },
  { fr: "Polenta", en: "Polenta", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60, picto: "🌽" },
  { fr: "Châtaigne", en: "Chestnuts", category: IngredientCategory.STARCH, proteinPer100g: 2, defaultQuantityG: 100, picto: "🌰" },
  // ── Petit-déjeuner
  { fr: "Flocons d'avoine", en: "Rolled oats", category: IngredientCategory.STARCH, proteinPer100g: 13, defaultQuantityG: 60, picto: "🥣" },
  { fr: "Son d'avoine", en: "Oat bran", category: IngredientCategory.STARCH, proteinPer100g: 17, defaultQuantityG: 30, picto: "🥣" },
  { fr: "Muesli", en: "Muesli", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 60, picto: "🥣" },
  { fr: "Granola", en: "Granola", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 50, picto: "🥣" },
  // ── Pains & wraps
  { fr: "Pain", en: "Bread", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60, picto: "🍞" },
  { fr: "Pain complet", en: "Whole wheat bread", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60, picto: "🍞" },
  { fr: "Pain aux céréales", en: "Multigrain bread", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 60, picto: "🍞" },
  { fr: "Pain de mie", en: "Sandwich bread", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 50, picto: "🍞" },
  { fr: "Baguette", en: "Baguette", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60, picto: "🥖" },
  { fr: "Pain pita", en: "Pita bread", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60, picto: "🍞" },
  { fr: "Naan", en: "Naan", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 80, picto: "🍞" },
  { fr: "Bagel", en: "Bagel", category: IngredientCategory.STARCH, proteinPer100g: 11, defaultQuantityG: 85, picto: "🥯" },
  { fr: "Muffin anglais", en: "English muffin", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60, picto: "🍞" },
  { fr: "Biscotte", en: "Rusk", category: IngredientCategory.STARCH, proteinPer100g: 11, defaultQuantityG: 20, picto: "🍞" },
  { fr: "Pain suédois", en: "Crispbread", category: IngredientCategory.STARCH, proteinPer100g: 10, defaultQuantityG: 20, picto: "🍞" },
  { fr: "Tortilla", en: "Tortilla", category: IngredientCategory.STARCH, proteinPer100g: 8, defaultQuantityG: 60, picto: "🌯" },
  { fr: "Wrap complet", en: "Whole wheat wrap", category: IngredientCategory.STARCH, proteinPer100g: 9, defaultQuantityG: 60, picto: "🌯" },
  // ── Tubercules
  { fr: "Pomme de terre", en: "Potato", category: IngredientCategory.STARCH, proteinPer100g: 2, defaultQuantityG: 200, picto: "🥔" },
  { fr: "Patate douce", en: "Sweet potato", category: IngredientCategory.STARCH, proteinPer100g: 2, defaultQuantityG: 200, picto: "🍠" },

  // ══ VEGETABLE ══ cru. Feuilles 1-3 · racines 1-2 · l'ail (6) est le haut documenté.
  // ── Feuilles & salades
  { fr: "Épinards", en: "Spinach", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100, picto: "🥬" },
  { fr: "Chou kale", en: "Kale", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100, picto: "🥬" },
  { fr: "Blette", en: "Swiss chard", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Pak choï", en: "Bok choy", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.5, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Salade verte", en: "Lettuce", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 50, picto: "🥬" },
  { fr: "Laitue romaine", en: "Romaine lettuce", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 60, picto: "🥬" },
  { fr: "Mâche", en: "Lamb's lettuce", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 40, picto: "🥬" },
  { fr: "Roquette", en: "Arugula", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.6, defaultQuantityG: 40, picto: "🥬" },
  { fr: "Cresson", en: "Watercress", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.3, defaultQuantityG: 40, picto: "🥬" },
  { fr: "Endive", en: "Endive", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100 },
  // ── Choux
  { fr: "Brocoli", en: "Broccoli", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 150, picto: "🥦" },
  { fr: "Brocolini", en: "Broccolini", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 150, picto: "🥦" },
  { fr: "Chou-fleur", en: "Cauliflower", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150 },
  { fr: "Riz de chou-fleur", en: "Cauliflower rice", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150 },
  { fr: "Chou", en: "Cabbage", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.3, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Chou rouge", en: "Red cabbage", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.4, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Chou chinois", en: "Napa cabbage", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Chou de Bruxelles", en: "Brussels sprouts", category: IngredientCategory.VEGETABLE, proteinPer100g: 3.4, defaultQuantityG: 150, picto: "🥬" },
  { fr: "Chou-rave", en: "Kohlrabi", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.7, defaultQuantityG: 150 },
  // ── Fruits-légumes
  { fr: "Tomate", en: "Tomato", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100, picto: "🍅" },
  { fr: "Tomates cerises", en: "Cherry tomatoes", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100, picto: "🍅" },
  { fr: "Courgette", en: "Zucchini", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150, picto: "🥒" },
  { fr: "Aubergine", en: "Eggplant", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150, picto: "🍆" },
  { fr: "Poivron", en: "Bell pepper", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100, picto: "🫑" },
  { fr: "Concombre", en: "Cucumber", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100, picto: "🥒" },
  { fr: "Avocat", en: "Avocado", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 100, picto: "🥑" },
  { fr: "Gombo", en: "Okra", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 100 },
  // ── Courges
  { fr: "Courge", en: "Squash", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150, picto: "🎃" },
  { fr: "Butternut", en: "Butternut squash", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150, picto: "🎃" },
  { fr: "Potimarron", en: "Red kuri squash", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.4, defaultQuantityG: 150, picto: "🎃" },
  { fr: "Potiron", en: "Pumpkin", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150, picto: "🎃" },
  { fr: "Courge spaghetti", en: "Spaghetti squash", category: IngredientCategory.VEGETABLE, proteinPer100g: 0.6, defaultQuantityG: 200, picto: "🎃" },
  // ── Racines & tubercules
  { fr: "Carotte", en: "Carrot", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 100, picto: "🥕" },
  { fr: "Betterave", en: "Beets", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.6, defaultQuantityG: 100 },
  { fr: "Navet", en: "Turnip", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 150 },
  { fr: "Panais", en: "Parsnip", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 150 },
  { fr: "Rutabaga", en: "Rutabaga", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 150 },
  { fr: "Radis", en: "Radish", category: IngredientCategory.VEGETABLE, proteinPer100g: 0.7, defaultQuantityG: 60 },
  { fr: "Céleri-rave", en: "Celeriac", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.5, defaultQuantityG: 150 },
  { fr: "Salsifis", en: "Salsify", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.4, defaultQuantityG: 150 },
  { fr: "Topinambour", en: "Jerusalem artichoke", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150 },
  // ── Alliacées & tiges
  { fr: "Oignon", en: "Onion", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 60, picto: "🧅" },
  { fr: "Oignon rouge", en: "Red onion", category: IngredientCategory.VEGETABLE, proteinPer100g: 1, defaultQuantityG: 60, picto: "🧅" },
  { fr: "Échalote", en: "Shallot", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.5, defaultQuantityG: 30, picto: "🧅" },
  { fr: "Cébette", en: "Green onion", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.8, defaultQuantityG: 30, picto: "🧅" },
  { fr: "Ail", en: "Garlic", category: IngredientCategory.VEGETABLE, proteinPer100g: 6, defaultQuantityG: 5, picto: "🧄" },
  { fr: "Poireau", en: "Leek", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.5, defaultQuantityG: 100, picto: "🥬" },
  { fr: "Céleri", en: "Celery", category: IngredientCategory.VEGETABLE, proteinPer100g: 0.7, defaultQuantityG: 100 },
  { fr: "Fenouil", en: "Fennel", category: IngredientCategory.VEGETABLE, proteinPer100g: 1.2, defaultQuantityG: 100 },
  { fr: "Asperge", en: "Asparagus", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.2, defaultQuantityG: 120 },
  { fr: "Artichaut", en: "Artichoke", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100 },
  { fr: "Cœur de palmier", en: "Hearts of palm", category: IngredientCategory.VEGETABLE, proteinPer100g: 2.5, defaultQuantityG: 100 },
  // ── Gousses, grains & divers
  { fr: "Haricots verts", en: "Green beans", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150, picto: "🫛" },
  { fr: "Haricots beurre", en: "Wax beans", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150, picto: "🫛" },
  { fr: "Petits pois", en: "Peas", category: IngredientCategory.VEGETABLE, proteinPer100g: 5, defaultQuantityG: 100, picto: "🫛" },
  { fr: "Pois gourmands", en: "Snap peas", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100, picto: "🫛" },
  { fr: "Pousses de soja", en: "Bean sprouts", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100, picto: "🫛" },
  { fr: "Maïs", en: "Corn", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 80, picto: "🌽" },
  { fr: "Champignons", en: "Mushrooms", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 100, picto: "🍄" },
  { fr: "Mélange de légumes", en: "Mixed vegetables", category: IngredientCategory.VEGETABLE, proteinPer100g: 2, defaultQuantityG: 150, picto: "🥦" },
  { fr: "Nori", en: "Nori", category: IngredientCategory.VEGETABLE, proteinPer100g: 6, defaultQuantityG: 5 },
  { fr: "Wakamé", en: "Wakame", category: IngredientCategory.VEGETABLE, proteinPer100g: 3, defaultQuantityG: 10 },

  // ══ FRUIT ══ cru. Frais 0.3-2 · séché 2-4.
  // ── Fruits du quotidien
  { fr: "Banane", en: "Banana", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 120, picto: "🍌" },
  { fr: "Pomme", en: "Apple", category: IngredientCategory.FRUIT, proteinPer100g: 0.3, defaultQuantityG: 150, picto: "🍎" },
  { fr: "Poire", en: "Pear", category: IngredientCategory.FRUIT, proteinPer100g: 0.4, defaultQuantityG: 150, picto: "🍐" },
  { fr: "Raisin", en: "Grapes", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100, picto: "🍇" },
  { fr: "Kaki", en: "Persimmon", category: IngredientCategory.FRUIT, proteinPer100g: 0.6, defaultQuantityG: 150 },
  // ── Agrumes
  { fr: "Orange", en: "Orange", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 150, picto: "🍊" },
  { fr: "Clémentine", en: "Clementine", category: IngredientCategory.FRUIT, proteinPer100g: 0.9, defaultQuantityG: 80, picto: "🍊" },
  { fr: "Mandarine", en: "Mandarin", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 80, picto: "🍊" },
  { fr: "Pamplemousse", en: "Grapefruit", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 200, picto: "🍊" },
  { fr: "Citron", en: "Lemon", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 30, picto: "🍋" },
  { fr: "Citron vert", en: "Lime", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 30, picto: "🍋" },
  // ── Baies
  { fr: "Fruits rouges", en: "Mixed berries", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 100, picto: "🫐" },
  { fr: "Fraise", en: "Strawberries", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 120, picto: "🍓" },
  { fr: "Framboise", en: "Raspberries", category: IngredientCategory.FRUIT, proteinPer100g: 1.2, defaultQuantityG: 100, picto: "🍓" },
  { fr: "Myrtille", en: "Blueberries", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100, picto: "🫐" },
  { fr: "Mûre", en: "Blackberries", category: IngredientCategory.FRUIT, proteinPer100g: 1.4, defaultQuantityG: 100, picto: "🫐" },
  { fr: "Cassis", en: "Blackcurrant", category: IngredientCategory.FRUIT, proteinPer100g: 1.4, defaultQuantityG: 100, picto: "🫐" },
  { fr: "Groseille", en: "Redcurrant", category: IngredientCategory.FRUIT, proteinPer100g: 1.1, defaultQuantityG: 100, picto: "🫐" },
  { fr: "Cerise", en: "Cherries", category: IngredientCategory.FRUIT, proteinPer100g: 1, defaultQuantityG: 100, picto: "🍒" },
  // ── Fruits à noyau
  { fr: "Pêche", en: "Peach", category: IngredientCategory.FRUIT, proteinPer100g: 0.9, defaultQuantityG: 120, picto: "🍑" },
  { fr: "Nectarine", en: "Nectarine", category: IngredientCategory.FRUIT, proteinPer100g: 1.1, defaultQuantityG: 120, picto: "🍑" },
  { fr: "Abricot", en: "Apricot", category: IngredientCategory.FRUIT, proteinPer100g: 1.4, defaultQuantityG: 100, picto: "🍑" },
  { fr: "Prune", en: "Plum", category: IngredientCategory.FRUIT, proteinPer100g: 0.7, defaultQuantityG: 100 },
  // ── Exotiques & melons
  { fr: "Kiwi", en: "Kiwi", category: IngredientCategory.FRUIT, proteinPer100g: 1.1, defaultQuantityG: 100, picto: "🥝" },
  { fr: "Mangue", en: "Mango", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 120, picto: "🥭" },
  { fr: "Ananas", en: "Pineapple", category: IngredientCategory.FRUIT, proteinPer100g: 0.5, defaultQuantityG: 120, picto: "🍍" },
  { fr: "Papaye", en: "Papaya", category: IngredientCategory.FRUIT, proteinPer100g: 0.5, defaultQuantityG: 150, picto: "🥭" },
  { fr: "Litchi", en: "Lychee", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 100 },
  { fr: "Goyave", en: "Guava", category: IngredientCategory.FRUIT, proteinPer100g: 2.6, defaultQuantityG: 100 },
  { fr: "Fruit de la passion", en: "Passion fruit", category: IngredientCategory.FRUIT, proteinPer100g: 2.2, defaultQuantityG: 50 },
  { fr: "Physalis", en: "Physalis", category: IngredientCategory.FRUIT, proteinPer100g: 1.9, defaultQuantityG: 50 },
  { fr: "Noix de coco", en: "Coconut", category: IngredientCategory.FRUIT, proteinPer100g: 3, defaultQuantityG: 50, picto: "🥥" },
  { fr: "Grenade", en: "Pomegranate", category: IngredientCategory.FRUIT, proteinPer100g: 1.7, defaultQuantityG: 100 },
  { fr: "Figue", en: "Fig", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 100 },
  { fr: "Pastèque", en: "Watermelon", category: IngredientCategory.FRUIT, proteinPer100g: 0.6, defaultQuantityG: 200, picto: "🍉" },
  { fr: "Melon", en: "Melon", category: IngredientCategory.FRUIT, proteinPer100g: 0.8, defaultQuantityG: 200, picto: "🍈" },
  { fr: "Rhubarbe", en: "Rhubarb", category: IngredientCategory.FRUIT, proteinPer100g: 0.9, defaultQuantityG: 120 },
  // ── Séchés & transformés
  { fr: "Datte", en: "Dates", category: IngredientCategory.FRUIT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { fr: "Raisins secs", en: "Raisins", category: IngredientCategory.FRUIT, proteinPer100g: 3, defaultQuantityG: 30, picto: "🍇" },
  { fr: "Abricots secs", en: "Dried apricots", category: IngredientCategory.FRUIT, proteinPer100g: 3.4, defaultQuantityG: 30, picto: "🍑" },
  { fr: "Pruneaux", en: "Prunes", category: IngredientCategory.FRUIT, proteinPer100g: 2.2, defaultQuantityG: 30 },
  { fr: "Figues sèches", en: "Dried figs", category: IngredientCategory.FRUIT, proteinPer100g: 3.3, defaultQuantityG: 30 },
  { fr: "Cranberries séchées", en: "Dried cranberries", category: IngredientCategory.FRUIT, proteinPer100g: 0.2, defaultQuantityG: 30, picto: "🫐" },
  { fr: "Banane séchée", en: "Dried banana", category: IngredientCategory.FRUIT, proteinPer100g: 3.9, defaultQuantityG: 30, picto: "🍌" },
  { fr: "Compote de pomme", en: "Applesauce", category: IngredientCategory.FRUIT, proteinPer100g: 0.3, defaultQuantityG: 100, picto: "🍎" },
  { fr: "Salade de fruits", en: "Fruit salad", category: IngredientCategory.FRUIT, proteinPer100g: 0.6, defaultQuantityG: 150 },

  // ══ NUTS_SEEDS ══ cru / tel qu'acheté. Fourchette 7-31.
  // ── Fruits à coque
  { fr: "Amandes", en: "Almonds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Amandes effilées", en: "Sliced almonds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 15, picto: "🌰" },
  { fr: "Poudre d'amande", en: "Almond flour", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Noix", en: "Walnuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 15, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Noisettes", en: "Hazelnuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 15, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Noix de cajou", en: "Cashews", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 30, picto: "🥜" },
  { fr: "Pistaches", en: "Pistachios", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 20, defaultQuantityG: 30, picto: "🥜" },
  { fr: "Cacahuètes", en: "Peanuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 26, defaultQuantityG: 30, picto: "🥜" },
  { fr: "Noix de pécan", en: "Pecans", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 9, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Noix du Brésil", en: "Brazil nuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 14, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Noix de macadamia", en: "Macadamia nuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 8, defaultQuantityG: 30, picto: "🌰" },
  { fr: "Pignons de pin", en: "Pine nuts", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 14, defaultQuantityG: 15, picto: "🌰" },
  { fr: "Noix de coco râpée", en: "Shredded coconut", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 7, defaultQuantityG: 20, picto: "🥥" },
  // ── Graines
  { fr: "Graines de chia", en: "Chia seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 17, defaultQuantityG: 15 },
  { fr: "Graines de courge", en: "Pumpkin seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 30, defaultQuantityG: 15 },
  { fr: "Graines de lin", en: "Flaxseeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 15 },
  { fr: "Graines de tournesol", en: "Sunflower seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 15 },
  { fr: "Graines de sésame", en: "Sesame seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 10 },
  { fr: "Graines de chanvre", en: "Hemp seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 31, defaultQuantityG: 15 },
  { fr: "Graines de pavot", en: "Poppy seeds", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 10 },
  // ── Purées
  { fr: "Beurre de cacahuète", en: "Peanut butter", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 25, defaultQuantityG: 20, picto: "🥜" },
  { fr: "Purée d'amande", en: "Almond butter", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 21, defaultQuantityG: 20, picto: "🥜" },
  { fr: "Purée de noisette", en: "Hazelnut butter", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 15, defaultQuantityG: 20, picto: "🥜" },
  { fr: "Purée de cajou", en: "Cashew butter", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 18, defaultQuantityG: 20, picto: "🥜" },
  { fr: "Tahini", en: "Tahini", category: IngredientCategory.NUTS_SEEDS, proteinPer100g: 17, defaultQuantityG: 20, picto: "🥜" },

  // ══ LEGUME ══ CUIT / conserve égouttée (c'est ainsi qu'on les met dans une recette).
  //             Légumineuses 7-11 · tofu 15 · PST réhydratée 17 · tempeh 19 · seitan 25.
  // ── Légumineuses
  { fr: "Lentilles", en: "Lentils", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Lentilles vertes", en: "Green lentils", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Lentilles corail", en: "Red lentils", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Lentilles beluga", en: "Beluga lentils", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Pois chiches", en: "Chickpeas", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Pois chiches grillés", en: "Roasted chickpeas", category: IngredientCategory.LEGUME, proteinPer100g: 19, defaultQuantityG: 30, picto: "🫘" },
  { fr: "Pois cassés", en: "Split peas", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Haricots rouges", en: "Kidney beans", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Haricots blancs", en: "White beans", category: IngredientCategory.LEGUME, proteinPer100g: 7, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Haricots noirs", en: "Black beans", category: IngredientCategory.LEGUME, proteinPer100g: 9, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Haricots azuki", en: "Adzuki beans", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Haricots borlotti", en: "Borlotti beans", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Flageolets", en: "Flageolet beans", category: IngredientCategory.LEGUME, proteinPer100g: 7, defaultQuantityG: 150, picto: "🫘" },
  { fr: "Fèves", en: "Fava beans", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 120, picto: "🫘" },
  { fr: "Graines de soja", en: "Soybeans", category: IngredientCategory.LEGUME, proteinPer100g: 16, defaultQuantityG: 100, picto: "🫘" },
  { fr: "Edamame", en: "Edamame", category: IngredientCategory.LEGUME, proteinPer100g: 11, defaultQuantityG: 100, picto: "🫛" },
  // ── Protéines végétales transformées
  { fr: "Tofu ferme", en: "Extra-firm tofu", category: IngredientCategory.LEGUME, proteinPer100g: 15, defaultQuantityG: 150 },
  { fr: "Tofu soyeux", en: "Silken tofu", category: IngredientCategory.LEGUME, proteinPer100g: 6, defaultQuantityG: 150 },
  { fr: "Tofu fumé", en: "Smoked tofu", category: IngredientCategory.LEGUME, proteinPer100g: 17, defaultQuantityG: 150 },
  { fr: "Tofu mariné", en: "Marinated tofu", category: IngredientCategory.LEGUME, proteinPer100g: 16, defaultQuantityG: 150 },
  { fr: "Tempeh", en: "Tempeh", category: IngredientCategory.LEGUME, proteinPer100g: 19, defaultQuantityG: 120 },
  { fr: "Seitan", en: "Seitan", category: IngredientCategory.LEGUME, proteinPer100g: 25, defaultQuantityG: 120 },
  { fr: "Protéine de soja texturée", en: "Textured soy protein", category: IngredientCategory.LEGUME, proteinPer100g: 17, defaultQuantityG: 100 },
  { fr: "Steak végétal", en: "Veggie burger patty", category: IngredientCategory.LEGUME, proteinPer100g: 17, defaultQuantityG: 100 },
  { fr: "Falafel", en: "Falafel", category: IngredientCategory.LEGUME, proteinPer100g: 13, defaultQuantityG: 100 },
  { fr: "Houmous", en: "Hummus", category: IngredientCategory.LEGUME, proteinPer100g: 8, defaultQuantityG: 40 },

  // ══ CONDIMENT ══ tel que vendu, basiques supposés dispo, petites quantités.
  //   ÉPICES ET HERBES SÈCHES = 0 : pas exact (l'origan sec fait ~9), mais à 2-3 g la
  //   contribution est < 0.3 g — et une valeur non nulle inciterait le chef à gonfler la
  //   jauge au paprika. On ne garde du non-zéro que pour les vrais contributeurs.
  // ── Huiles & matières grasses
  { fr: "Huile d'olive", en: "Olive oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10, picto: "🫒" },
  { fr: "Huile de colza", en: "Canola oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Huile de tournesol", en: "Sunflower oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Huile de coco", en: "Coconut oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10, picto: "🥥" },
  { fr: "Huile de sésame", en: "Sesame oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 5 },
  { fr: "Huile de noix", en: "Walnut oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Huile d'arachide", en: "Peanut oil", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Beurre", en: "Butter", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 10, picto: "🧈" },
  // ── Crèmes
  { fr: "Crème fraîche", en: "Cream", category: IngredientCategory.CONDIMENT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { fr: "Crème liquide", en: "Heavy cream", category: IngredientCategory.CONDIMENT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { fr: "Crème épaisse", en: "Thick cream", category: IngredientCategory.CONDIMENT, proteinPer100g: 2.5, defaultQuantityG: 30 },
  { fr: "Crème de coco", en: "Coconut cream", category: IngredientCategory.CONDIMENT, proteinPer100g: 2, defaultQuantityG: 50, picto: "🥥" },
  { fr: "Lait de coco", en: "Coconut milk", category: IngredientCategory.CONDIMENT, proteinPer100g: 2, defaultQuantityG: 100, picto: "🥥" },
  // ── Sel, poivre, piment
  { fr: "Sel", en: "Salt", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🧂" },
  { fr: "Fleur de sel", en: "Sea salt", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🧂" },
  { fr: "Poivre", en: "Black pepper", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1 },
  { fr: "Piment en flocons", en: "Chili flakes", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1, picto: "🌶️" },
  { fr: "Piment de Cayenne", en: "Cayenne pepper", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1, picto: "🌶️" },
  { fr: "Piment d'Espelette", en: "Espelette pepper", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🌶️" },
  // ── Épices sèches
  { fr: "Épices", en: "Spices", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3, picto: "🌶️" },
  { fr: "Paprika", en: "Paprika", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3, picto: "🌶️" },
  { fr: "Paprika fumé", en: "Smoked paprika", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3, picto: "🌶️" },
  { fr: "Cumin", en: "Cumin", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Curry", en: "Curry powder", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Curcuma", en: "Turmeric", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Gingembre moulu", en: "Ground ginger", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Cannelle", en: "Cinnamon", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Muscade", en: "Nutmeg", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1 },
  { fr: "Coriandre moulue", en: "Ground coriander", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Ail en poudre", en: "Garlic powder", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3, picto: "🧄" },
  { fr: "Oignon en poudre", en: "Onion powder", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3, picto: "🧅" },
  { fr: "Herbes de Provence", en: "Herbes de Provence", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🌿" },
  { fr: "Origan séché", en: "Dried oregano", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🌿" },
  { fr: "Thym séché", en: "Dried thyme", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 2, picto: "🌿" },
  { fr: "Laurier", en: "Bay leaf", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 1, picto: "🌿" },
  { fr: "Ras el-hanout", en: "Ras el hanout", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Garam masala", en: "Garam masala", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 3 },
  // ── Herbes fraîches
  { fr: "Persil", en: "Parsley", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Basilic", en: "Basil", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Coriandre", en: "Cilantro", category: IngredientCategory.CONDIMENT, proteinPer100g: 2, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Menthe", en: "Mint", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Ciboulette", en: "Chives", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Aneth", en: "Dill", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Estragon", en: "Tarragon", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌿" },
  { fr: "Thym", en: "Thyme", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 5, picto: "🌿" },
  { fr: "Romarin", en: "Rosemary", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 5, picto: "🌿" },
  { fr: "Sauge", en: "Sage", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 5, picto: "🌿" },
  { fr: "Gingembre frais", en: "Fresh ginger", category: IngredientCategory.CONDIMENT, proteinPer100g: 1.8, defaultQuantityG: 10 },
  // ── Sauces & pâtes
  { fr: "Sauce soja", en: "Soy sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 8, defaultQuantityG: 15, picto: "🍶" },
  { fr: "Sauce teriyaki", en: "Teriyaki sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 4, defaultQuantityG: 20, picto: "🍶" },
  { fr: "Sauce huître", en: "Oyster sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 2, defaultQuantityG: 20 },
  { fr: "Sauce poisson", en: "Fish sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 5, defaultQuantityG: 10 },
  { fr: "Sriracha", en: "Sriracha", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 10, picto: "🌶️" },
  { fr: "Harissa", en: "Harissa", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 10, picto: "🌶️" },
  { fr: "Wasabi", en: "Wasabi", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 5 },
  { fr: "Miso", en: "Miso paste", category: IngredientCategory.CONDIMENT, proteinPer100g: 12, defaultQuantityG: 20 },
  { fr: "Pâte de curry", en: "Curry paste", category: IngredientCategory.CONDIMENT, proteinPer100g: 3, defaultQuantityG: 20 },
  { fr: "Moutarde", en: "Mustard", category: IngredientCategory.CONDIMENT, proteinPer100g: 5, defaultQuantityG: 10 },
  { fr: "Moutarde de Dijon", en: "Dijon mustard", category: IngredientCategory.CONDIMENT, proteinPer100g: 6, defaultQuantityG: 10 },
  { fr: "Mayonnaise", en: "Mayonnaise", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 15 },
  { fr: "Ketchup", en: "Ketchup", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 15, picto: "🥫" },
  { fr: "Sauce barbecue", en: "Barbecue sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 20, picto: "🥫" },
  { fr: "Pesto", en: "Pesto", category: IngredientCategory.CONDIMENT, proteinPer100g: 4, defaultQuantityG: 20 },
  { fr: "Sauce vinaigrette", en: "Salad dressing", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 20 },
  // ── Bases tomate
  { fr: "Sauce tomate", en: "Tomato sauce", category: IngredientCategory.CONDIMENT, proteinPer100g: 1.5, defaultQuantityG: 100, picto: "🥫" },
  { fr: "Concentré de tomate", en: "Tomato paste", category: IngredientCategory.CONDIMENT, proteinPer100g: 4, defaultQuantityG: 30, picto: "🥫" },
  { fr: "Tomates concassées", en: "Crushed tomatoes", category: IngredientCategory.CONDIMENT, proteinPer100g: 1.3, defaultQuantityG: 150, picto: "🥫" },
  // ── Vinaigres & acides
  { fr: "Vinaigre", en: "Vinegar", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Vinaigre balsamique", en: "Balsamic vinegar", category: IngredientCategory.CONDIMENT, proteinPer100g: 0.5, defaultQuantityG: 10 },
  { fr: "Vinaigre de cidre", en: "Apple cider vinegar", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Jus de citron", en: "Lemon juice", category: IngredientCategory.CONDIMENT, proteinPer100g: 0.4, defaultQuantityG: 15, picto: "🍋" },
  // ── Saumure & bouillons
  { fr: "Olives vertes", en: "Green olives", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 30, picto: "🫒" },
  { fr: "Olives noires", en: "Black olives", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 30, picto: "🫒" },
  { fr: "Câpres", en: "Capers", category: IngredientCategory.CONDIMENT, proteinPer100g: 2.4, defaultQuantityG: 10 },
  { fr: "Cornichons", en: "Pickles", category: IngredientCategory.CONDIMENT, proteinPer100g: 0.7, defaultQuantityG: 20 },
  { fr: "Bouillon de volaille", en: "Chicken stock", category: IngredientCategory.CONDIMENT, proteinPer100g: 1, defaultQuantityG: 200 },
  { fr: "Bouillon de légumes", en: "Vegetable stock", category: IngredientCategory.CONDIMENT, proteinPer100g: 0.5, defaultQuantityG: 200 },
  // ── Sucrés
  { fr: "Miel", en: "Honey", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 20, picto: "🍯" },
  { fr: "Sirop d'érable", en: "Maple syrup", category: IngredientCategory.CONDIMENT, proteinPer100g: 0, defaultQuantityG: 20, picto: "🍯" },

  // ══ OTHER ══ épicerie / pantry : tout ce qui n'est ni un aliment frais ni un condiment.
  //            Volontairement hétérogène (sucre 0 → whey 78) — pas de fourchette possible.
  //            Les produits VÉGÉTAUX (boissons, yaourts, farines) vivent ici, jamais en DAIRY_EGG.
  // ── Poudres protéinées
  { fr: "Protéine whey", en: "Whey protein powder", category: IngredientCategory.OTHER, proteinPer100g: 78, defaultQuantityG: 30, picto: "🥛" },
  { fr: "Protéine végétale", en: "Plant protein powder", category: IngredientCategory.OTHER, proteinPer100g: 75, defaultQuantityG: 30, picto: "🥛" },
  { fr: "Caséine", en: "Casein protein powder", category: IngredientCategory.OTHER, proteinPer100g: 75, defaultQuantityG: 30, picto: "🥛" },
  { fr: "Barre protéinée", en: "Protein bar", category: IngredientCategory.OTHER, proteinPer100g: 30, defaultQuantityG: 60 },
  // ── Boissons & yaourts végétaux
  { fr: "Boisson d'amande", en: "Almond milk", category: IngredientCategory.OTHER, proteinPer100g: 0.5, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Boisson de soja", en: "Soy milk", category: IngredientCategory.OTHER, proteinPer100g: 3.3, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Boisson d'avoine", en: "Oat milk", category: IngredientCategory.OTHER, proteinPer100g: 1, defaultQuantityG: 200, picto: "🥛" },
  { fr: "Boisson de coco", en: "Coconut milk drink", category: IngredientCategory.OTHER, proteinPer100g: 0.2, defaultQuantityG: 200, picto: "🥥" },
  { fr: "Yaourt de soja", en: "Soy yogurt", category: IngredientCategory.OTHER, proteinPer100g: 4, defaultQuantityG: 125, picto: "🥛" },
  { fr: "Yaourt de coco", en: "Coconut yogurt", category: IngredientCategory.OTHER, proteinPer100g: 1, defaultQuantityG: 125, picto: "🥥" },
  { fr: "Jus d'orange", en: "Orange juice", category: IngredientCategory.OTHER, proteinPer100g: 0.7, defaultQuantityG: 200, picto: "🍊" },
  // ── Farines & poudres
  { fr: "Farine de blé", en: "Wheat flour", category: IngredientCategory.OTHER, proteinPer100g: 10, defaultQuantityG: 50 },
  { fr: "Farine complète", en: "Whole wheat flour", category: IngredientCategory.OTHER, proteinPer100g: 12, defaultQuantityG: 50 },
  { fr: "Farine de pois chiche", en: "Chickpea flour", category: IngredientCategory.OTHER, proteinPer100g: 20, defaultQuantityG: 50 },
  { fr: "Maïzena", en: "Cornstarch", category: IngredientCategory.OTHER, proteinPer100g: 0.3, defaultQuantityG: 15 },
  { fr: "Chapelure", en: "Breadcrumbs", category: IngredientCategory.OTHER, proteinPer100g: 12, defaultQuantityG: 30 },
  // ── Levures & agents
  { fr: "Levure chimique", en: "Baking powder", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 5 },
  { fr: "Levure de boulanger", en: "Yeast", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 5 },
  { fr: "Levure maltée", en: "Nutritional yeast", category: IngredientCategory.OTHER, proteinPer100g: 45, defaultQuantityG: 10 },
  { fr: "Bicarbonate", en: "Baking soda", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 3 },
  { fr: "Gélatine", en: "Gelatin", category: IngredientCategory.OTHER, proteinPer100g: 85, defaultQuantityG: 5 },
  { fr: "Agar-agar", en: "Agar-agar", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 2 },
  // ── Sucrés & cacao
  { fr: "Sucre", en: "Sugar", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 10 },
  { fr: "Édulcorant", en: "Sweetener", category: IngredientCategory.OTHER, proteinPer100g: 0, defaultQuantityG: 1 },
  { fr: "Cacao en poudre", en: "Cocoa powder", category: IngredientCategory.OTHER, proteinPer100g: 20, defaultQuantityG: 10, picto: "🍫" },
  { fr: "Chocolat noir", en: "Dark chocolate", category: IngredientCategory.OTHER, proteinPer100g: 8, defaultQuantityG: 20, picto: "🍫" },
  { fr: "Pépites de chocolat", en: "Chocolate chips", category: IngredientCategory.OTHER, proteinPer100g: 5, defaultQuantityG: 15, picto: "🍫" },
];
