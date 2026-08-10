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
- 🤖 **Rugosité du chef : « chercher avant de proposer »** — le prompt lui dit d'appeler
  `search_ingredients` AVANT de composer, mais `gpt-4o-mini` propose souvent d'abord et se fait
  refuser ensuite. Pistes : durcir le prompt, ou passer à un modèle qui suit mieux la consigne.
  *(Moins douloureux depuis le catalogue bilingue + 420 entrées, mais toujours là.)*
- **Activer le bot / clé LLM (BYO key)** : page **Paramètres** pour saisir sa clé (chiffrée,
  serveur only). **Mode par défaut** avec la clé de l'auteur mais **bridé** (limite d'usage)
  pour que n'importe qui teste. MVP = **ouvert sans limite**, on prévoit juste le bridage/config.
- **Comptes admin** : rôle `admin` (gérer les limites, voir l'usage) — introduit avec le point ci-dessus.
- **Compte — suppression** : bouton « supprimer mon compte » (différé — destructif, nécessite la
  *service-role key* côté serveur pour supprimer l'utilisateur Supabase Auth + cascade des données).
- **Bulle « ? » / centre d'aide** : la brique *durable* de l'onboarding (elle sert à J+200, pas
  seulement à J0). La carte « Visite guidée » sur `/account` en est le germe minimal. Ensuite :
  recherche, guides courts, **chef contextuel** (aide par page).
- **Checklist « 3 étapes pour démarrer »** : effet Zeigarnik, la 2ᵉ brique la plus efficace après
  les empty states. Quand on voudra pousser l'activation.
- **Mesurer l'activation** : `isDayComplete()` **est** l'événement « aha » (premier jour scellé au
  vert), mais rien ne l'enregistre. Ça, ce serait une vraie colonne.
- **Empty states restants** : `/recipes`, `/ingredients`, `/chat` sont encore des `<p>` gris nus
  (celui de `/batch` est fait). Voir « Livré récemment ».
- **Chef en bulle globale** (fenêtre en bas à droite sur tout le site) — **projet séparé, différé.**
  Prérequis nommés, dans l'ordre : (1) le chat est aujourd'hui **sans état**, `useChat` meurt à
  chaque navigation → il faut soit persister la conversation (nouveau modèle Prisma), soit un
  provider client au-dessus du router ; (2) **rate limiting / BYO key** (`PROD_CHECKLIST.md`) —
  une bulle présente partout multiplie l'exposition d'un endpoint sans limite sur clé partagée ;
  (3) injecter le **contexte de page** dans `buildChefSystemPrompt`, qui ne reçoit aujourd'hui que
  prénom + préférences + locale et ne peut donc pas savoir ce qui est à l'écran. Point de
  convergence : la dernière bulle de la visite pourra dire « et si tu bloques, le chef est là ».
- **Second tour sur le composeur** `/batch/[id]` (jauge, palette, tap-to-add) : à traiter seul,
  c'est la zone la plus fragile (dnd-kit + `TouchSensor`).

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
- **Onboarding, 3 briques** : (1) **écran de bienvenue** `/welcome` où l'inscription atterrit —
  prénom + poids, et la **jauge signature se remplit en direct** pendant la frappe (le moment « aha »
  arrive *pendant* l'onboarding) ; (2) **empty state de `/batch`** qui porte le CTA et relance sur la
  cible protéines ; (3) **visite guidée 4 bulles** (accueil → le chef → les recettes → nouveau batch),
  armée par `?tour=1`, rejouable depuis `/account`. **Zéro migration, zéro nouvelle dépendance** —
  détail et pourquoi : `DECISIONS.md` (2026-08-10). Au passage : CTA « Nouveau batch » passé à 44 px
  (violation PRINCIPLES §5 préexistante), parsing du profil factorisé (`lib/profile.ts`), et les deux
  relances « règle ta cible » pointent désormais vers `/welcome`. 22 tests e2e verts (7 nouveaux).
- **`npm test` redevenu vert** : `vitest.config.ts` exclut `**/e2e/**` (Vitest ramassait le spec
  Playwright et échouait toujours) **et `.claude/worktrees/**`** (sinon un run depuis le checkout
  principal collecte chaque test deux fois), et déclare l'alias `@/` pour les tests. 47 tests
  verts dans les deux checkouts ; `npm run e2e` inchangé.
- **Catalogue d'ingrédients bilingue (FR/EN) + 157 → 420** : `nameFr`/`nameEn` +
  `normalizedNameFr`/`normalizedNameEn` (2 clés uniques), les outils du chef résolvent dans
  **les deux langues**. Corrige le vrai bug de la démo : « Olive oil » ne matchait pas
  « Huile d'olive » alors que la ligne existait. CONDIMENT 14 → 79 (épices, herbes et sauces
  individuelles, bases cuisine), nouilles, fromages, `OTHER` activé en rayon épicerie.
  Seed rendu **non destructif** au passage (les batchs ne perdent plus les recettes
  bibliothèque). Détail : `DECISIONS.md` (2026-08-08).
- **Langue du chef corrigée** : le chef répond dans la langue de l'UI. Le client envoie sa
  locale (`useLocale`) dans le body de `/api/chat` ; le serveur la privilégie (puis cookie,
  puis défaut). Avant : la route, hors segment `[locale]`, ne lisait que le cookie `NEXT_LOCALE`
  et retombait sur EN sur un device FR sans cookie.
- **Mot de passe oublié** : lien sur `/login` → `/forgot-password` (réponse **neutre**
  anti-énumération) → email → `/api/auth/callback` (échange du `code` **PKCE** contre une
  session) → `/reset-password`. Bout-en-bout validé **localhost + Vercel**, i18n FR/EN.
  Détail & choix : `DECISIONS.md` (2026-08-08).
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
