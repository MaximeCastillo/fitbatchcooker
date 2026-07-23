# Roadmap

Plan **vivant et mutable** — la liste "à faire / en cours". Claude le maintient : on
**retire un item dès qu'il est livré** (une courte section "Livré récemment" garde le fil
entre sessions). À relire en début de session.

Complémentaire : `PROJECT_SPEC.md` (le produit aujourd'hui) · `DECISIONS.md` (historique
figé du pourquoi) · `PROD_CHECKLIST.md` (dettes avant prod) · `LEARNING_LOG.md` (journal).

---

## 🎯 En cours
- **Cœur produit — "Ma semaine"** : modèles `MealPlan`/`PlanEntry`, jauges = **motif
  remplissage**, quota de batch, suggestions de complément.

## ⏭️ Court terme
- **Onboarding léger** : réutiliser l'écran Profil (étape 1) + **empty states** qui guident.
- **Guide** : product-tour léger ("clique ici") + **chef contextuel** (aide par page).

## 🔭 Plus tard / idées
- **3D** : d'abord la **célébration "jour scellé au vert"** (1er moment 3D, périmètre
  maîtrisé) ; **mascotte** (2D puis éventuellement 3D) bien après, si ça décolle.
- **`create_recipe`** : le chef persiste une recette validée ("ok").
- **"Ce que le chef sait de moi"** : écran préférences éditable/supprimable.
- **Éviter les doublons de recettes** : injecter les titres existants / outil `search_recipes`.
- **Ingrédients structurés** (`Ingredient`/`RecipeIngredient`) quand une feature l'exige
  (liste de courses, scaling des portions).
- Icônes : tester le duotone **Phosphor** (optionnel).
- Durcissement avant prod → voir `PROD_CHECKLIST.md` (ne pas dupliquer ici).

## ✅ Livré récemment
- **Home nouveau user** : pitch + CTA (motif remplissage) ; user connecté redirigé vers son espace.
- **Écran de login soigné** (panneau valeur + formulaire, motif remplissage).
- Redesign socle : tokens vert+orange, typo Barlow, **shell à sidebar**, motif remplissage (prototype).
- Perf : région Vercel (fra1), dédup `getCurrentUser` + `cache()`, optimistic UI, skeletons.
- Chef : chat streaming + **tool calling** `save_preference` (capture + recall), garde-fous sécurité.
- Livre de recettes perso (`UserRecipe`), profil (prénom + objectif protéines).
- Auth Supabase complète, déploiement Vercel.
