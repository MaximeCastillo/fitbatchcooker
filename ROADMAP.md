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
- [~] **Mobile tap-first** (`PRINCIPLES.md` §5) — **v1 faite** : tap-to-add (« + » → « ajouter
      à quel jour ? »), actions visibles au doigt, scroll vs drag réglé (Mouse/Touch sensors).
      **Reste** : test mobile réel, chemin **tap pour déplacer** entre jours, affiner cibles ≥ 44 px.
- _MVP mono-mangeur (toi) ; schéma additif pour le multi-personnes plus tard._

## 🍳 Recettes riches (détail · encas · images · ingrédients) — **3 phases sur 4 livrées**

Séquencement validé le 2026-07-24, **état revu le 2026-07-26** : A, B et D sont faites
(B et D ont dévié du plan initial, voir ci-dessous), il ne reste que **C — les images**,
plus deux morceaux détachés (palette par type, liste de courses). Voir `PRINCIPLES.md`
pour la philosophie protéines/part et `DECISIONS.md` pour le pourquoi.

- ✅ **Phase A — Page détail recette** livrée (voir « Livré récemment »).
- ✅ **Phase B — Encas / compléments** livrée, **sous une autre forme** : pas de
  `Recipe.kind` (`MAIN`|`SNACK`) mais un **`MealType`** (`MAIN`|`SNACK`|`BREAKFAST`,
  migration `20260724215827`) qui couvre le petit-déj en prime. Seed : **6 encas +
  5 petits-déj**. Filtres par type sur `/recipes`, **multi-select** depuis le 2026-07-25.
  - ⚠️ **Seul morceau non fait** : la **palette du composeur ignore le type** (elle ne
    filtre que par favoris + recherche texte, `batch-board.tsx`). Pas d'onglets
    « Recettes / Encas » pour attraper un encas quand il manque 15 g. *(petit coût)*
- **Phase C — Images de plat** *(pas commencée)* : brique **Supabase Storage** (upload
  serveur, URL publique, policies) ; image sur la carte + la page détail. La colonne
  `Recipe.imageUrl` existe déjà et la carte a son emplacement (placeholder).
  *(coût moyen, concept neuf)*
- ✅ **Phase D — Couche ingrédients** livrée pour l'essentiel — elle était notée
  « différée, gros milestone » et s'est faite en cours de route.
  `Ingredient(proteinPer100g, defaultQuantityG, picto)` + `RecipeIngredient(quantityG)`,
  protéines/part **dérivées** (`recomputeRecipeProtein`), **pré-remplies par l'IA** via les
  outils `search_ingredients` / `create_recipe` sur un **catalogue verrouillé** (le chef ne
  peut pas inventer d'ingrédient), page `/ingredients` en recherche inversée, ~157 entrées.
  - ⚠️ **Reste ce que la couche débloque** : **liste de courses** et **scaling** des
    quantités. Ni l'un ni l'autre n'existe.

## ⏭️ Court terme
- **Activer le bot / clé LLM (BYO key)** : page **Paramètres** pour saisir sa clé (chiffrée,
  serveur only). **Mode par défaut** avec la clé de l'auteur mais **bridé** (limite d'usage)
  pour que n'importe qui teste. MVP = **ouvert sans limite**, on prévoit juste le bridage/config.
- **Comptes admin** : rôle `admin` (gérer les limites, voir l'usage) — introduit avec le point ci-dessus.
- **Compte — suppression** : bouton « supprimer mon compte » (différé — destructif, nécessite la
  *service-role key* côté serveur pour supprimer l'utilisateur Supabase Auth + cascade des données).
- **Onboarding léger** : réutiliser l'écran Profil (étape 1) + **empty states** qui guident.
- **Guide** : product-tour léger ("clique ici") + **chef contextuel** (aide par page).

## 🔭 Plus tard / idées
- **« Ajouter à mon batch » depuis les cartes recettes** (2ᵉ point d'entrée) — **écarté le 2026-07-26**, on n'en veut pas pour l'instant. Le seul chemin reste le composeur (glisser depuis la palette, ou « + » → « quel jour ? »).
- **3D** : d'abord la **célébration "jour scellé au vert"** (1er moment 3D, périmètre
  maîtrisé) ; **mascotte** (2D puis éventuellement 3D) bien après, si ça décolle.
- **"Ce que le chef sait de moi"** : écran préférences éditable/supprimable.
- **Éviter les doublons de recettes** : injecter les titres existants / outil `search_recipes`.
- **Multi-personnes** (additif) : `eaters` sur le plan (scale le quota, garde ta jauge perso),
  ou notion d'`Eater` avec objectif par personne. Quand le besoin est réel.
- **Suggestions douces non bloquantes** (« +35 g avec un blanc de poulet », « 3 petits-déj
  sur Jour 2 ? ») — jamais d'enforcement rigide. Post-MVP.
- Nommage : **"recette" partout** dans l'UI (catalogue *et* instance posée) — un seul mot
  pour éviter la confusion, aligné sur le menu « Recettes ». Géré via `lib/strings.ts`,
  re-challengeable (on pourra réintroduire "plat" pour l'instance si le besoin apparaît).
- Icônes : tester le duotone **Phosphor** (optionnel).
- Durcissement avant prod → voir `PROD_CHECKLIST.md` (ne pas dupliquer ici).

## ✅ Livré récemment
- **Encas & petits-déj (ex-« Phase B »)** : `MealType` (`MAIN`|`SNACK`|`BREAKFAST`) au lieu
  du `Recipe.kind` prévu, 6 encas + 5 petits-déj au seed, filtres par type sur `/recipes`.
- **Couche ingrédients (ex-« Phase D », qu'on croyait différée)** : catalogue ~157 entrées
  avec `proteinPer100g` + picto, `RecipeIngredient(quantityG)`, **protéines/part dérivées**
  au lieu de saisies, **remplies par l'IA** sur catalogue verrouillé, page `/ingredients`
  en recherche inversée.
- **Browse recettes, round 3** : filtres type de repas en **multi-select** (« Tous » = vider),
  **modale d'aperçu** au clic sur une carte (état client, la liste reste montée → filtres +
  scroll gardés), **filtres restaurés** au retour depuis la page recette (`?from=`), lien
  retour sur `/recipes/new`, warning d'hydratation `<body>` éteint. Détail : `DECISIONS.md`.
- **App multilingue (FR/EN)** — next-intl **sans préfixe** (défaut EN, détection device),
  catalogues ICU `messages/fr.json`/`en.json`, **sélecteur de langue** + **toggle clair/sombre**
  dans le chrome, 404 localisé, chef IA multilingue, `proxy.ts` (Next 16). **1ʳᵉ PR + preview
  Vercel** du projet (mergée). Détail : `DECISIONS.md`.
- **Recettes riches — Phase A** : page détail `/recipes/[id]` (étapes, macros, note « valeurs
  approximatives »), **cartes cliquables** (stretched-link), **marque-page** save en coin de carte.
- **Aperçu recette dans le composeur** : modale (Radix Dialog) qui **jaillit de la carte**
  cliquée ; rendu factorisé (`RecipeDetail` partagé page + modale).
- **Composeur unifié + mobile v1** : `RecipeChip` unique (palette = jours), **tap-to-add**
  (« + » → « ajouter à quel jour ? »), sensors Mouse/Touch (scroll vs drag), actions visibles au doigt.
- **Page « Mon compte »** (`/account`) : email connecté visible, changer email (confirmation
  Supabase) + mot de passe (re-vérif du MDP actuel), sync `User.email`.
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
