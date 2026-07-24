# Roadmap

Plan **vivant et mutable** — la liste "à faire / en cours". Claude le maintient : on
**retire un item dès qu'il est livré** (une courte section "Livré récemment" garde le fil
entre sessions). À relire en début de session.

Complémentaire : `PROJECT_SPEC.md` (le produit aujourd'hui) · `DECISIONS.md` (historique
figé du pourquoi) · `PROD_CHECKLIST.md` (dettes avant prod) · `LEARNING_LOG.md` (journal).

---

## 🎯 En cours — Cœur produit "batch"
- [x] **Modèles** `MealPlan` + `PlanEntry` (+ migration). ✅
- [x] **Composer au clic** : board 1 jour = 1 ligne, ajout/retrait, add/remove day. ✅
- [x] **Jauge par jour** = contenant qui se remplit (motif signature, scellage vert). ✅
- [x] **Quota "À cuisiner"** (portions par recette). ✅
- [x] **Multi-plans** : liste « Mes batchs », créer / renommer / supprimer. ✅
- [x] **Drag & drop** (`@dnd-kit`) : palette→jour, jour→jour, **Maj = dupliquer**,
      palette = zone « ranger », **optimistic UI** + fallback select. ✅
- [ ] **« Ajouter à mon batch »** depuis les cartes recettes (2ᵉ point d'entrée).
- [ ] **Polish mobile tap-first.**
- _MVP mono-mangeur (toi) ; schéma additif pour le multi-personnes plus tard._

## ⏭️ Court terme
- **Activer le bot / clé LLM (BYO key)** : page **Paramètres** pour saisir sa clé (chiffrée,
  serveur only). **Mode par défaut** avec la clé de l'auteur mais **bridé** (limite d'usage)
  pour que n'importe qui teste. MVP = **ouvert sans limite**, on prévoit juste le bridage/config.
- **Comptes admin** : rôle `admin` (gérer les limites, voir l'usage) — introduit avec le point ci-dessus.
- **Onboarding léger** : réutiliser l'écran Profil (étape 1) + **empty states** qui guident.
- **Guide** : product-tour léger ("clique ici") + **chef contextuel** (aide par page).

## 🔭 Plus tard / idées
- **3D** : d'abord la **célébration "jour scellé au vert"** (1er moment 3D, périmètre
  maîtrisé) ; **mascotte** (2D puis éventuellement 3D) bien après, si ça décolle.
- **"Ce que le chef sait de moi"** : écran préférences éditable/supprimable.
- **Éviter les doublons de recettes** : injecter les titres existants / outil `search_recipes`.
- **Protéines vérifiées — couche ingrédients** (gros milestone, après "Ma semaine") :
  `Ingredient(name, proteinPer100g, …)` + `RecipeIngredient(recipe, ingredient, quantityG)`
  → protéines **calculées** (Σ quantité/100 × proteinPer100g) au lieu d'estimées, vérifiables
  et personnalisables par l'user. La jauge lit "protéines de la recette" via un seul accès,
  donc ça ne bloque pas Ma semaine. Débloque aussi liste de courses + scaling.
- **Multi-personnes** (additif) : `eaters` sur le plan (scale le quota, garde ta jauge perso),
  ou notion d'`Eater` avec objectif par personne. Quand le besoin est réel.
- **Type de plat** (`mealType` : plat principal / encas / petit-déj…) + **suggestions douces
  non bloquantes** ("3 petits-déj sur Jour 2 ?") — jamais d'enforcement rigide. Post-MVP.
- Nommage : **"recette" partout** dans l'UI (catalogue *et* instance posée) — un seul mot
  pour éviter la confusion, aligné sur le menu « Recettes ». Géré via `lib/strings.ts`,
  re-challengeable (on pourra réintroduire "plat" pour l'instance si le besoin apparaît).
- Icônes : tester le duotone **Phosphor** (optionnel).
- Durcissement avant prod → voir `PROD_CHECKLIST.md` (ne pas dupliquer ici).

## ✅ Livré récemment
- **Undo à la Notion** (jour + batch) : suppression différée + toast « Annuler » (10 s, barre
  de décompte), zéro soft-delete en base. Drag & drop poli : **DragOverlay** (la recette reste
  en place dans la palette), jauge plus vivante, nommage unifié « recette ».
- **Home nouveau user** : pitch + CTA (motif remplissage) ; user connecté redirigé vers son espace.
- **Écran de login soigné** (panneau valeur + formulaire, motif remplissage).
- Redesign socle : tokens vert+orange, typo Barlow, **shell à sidebar**, motif remplissage (prototype).
- Perf : région Vercel (fra1), dédup `getCurrentUser` + `cache()`, optimistic UI, skeletons.
- Chef : chat streaming + **tool calling** `save_preference` (capture + recall), garde-fous sécurité.
- Livre de recettes perso (`UserRecipe`), profil (prénom + objectif protéines).
- Auth Supabase complète, déploiement Vercel.
