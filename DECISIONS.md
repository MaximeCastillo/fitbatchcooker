# Journal des décisions (ADR)

Append-only. Une entrée par décision/évolution notable. **On ne réécrit jamais** le
passé — si une décision est annulée, on ajoute une entrée qui la remplace (mention
"Remplace"). C'est l'historique du "pourquoi" ; `PROJECT_SPEC.md` = le "quoi
maintenant".

**Règle : très court.** Quelques lignes max par entrée. Le but est d'avoir *envie*
de relire. Modèle :

```
## AAAA-MM-JJ — <titre court>
**Décision :** …
**Pourquoi :** …
**Alternatives :** …
```

---

## 2026-07-17 — Stack : Next.js + TS + Tailwind/shadcn + Supabase + Prisma + Vercel
**Décision :** Next.js (App Router), TypeScript, Tailwind + shadcn/ui, Supabase
(Postgres + Auth), Prisma, déploiement Vercel.
**Pourquoi :** apprendre une stack moderne et très demandée, excellemment supportée
par les outils IA, pour construire "sans coder à la main".
**Alternatives :** rester sur Rails (rapide pour l'auteur mais ne sert pas
l'apprentissage) ; React + Vite SPA (pas de SSR) ; Nuxt (Vue) ; MongoDB (rejeté,
domaine relationnel).

## 2026-07-17 — Prisma comme ORM par défaut (vs Drizzle)
**Décision :** Prisma.
**Pourquoi :** schéma déclaratif + client généré, proche d'ActiveRecord → transition
la plus douce depuis Rails.
**Alternatives :** Drizzle (proche du SQL typé, plus explicite mais saut mental plus
grand).

## 2026-07-17 — IA : bring-your-own key (l'user paie l'inférence)
**Décision :** chaque user fournit sa clé API ; l'app ne paie pas l'inférence. Un
seul fournisseur au début.
**Pourquoi :** adapté à un projet perso/power-user, pas de coût d'inférence pour
l'auteur. Multi-fournisseurs = complexité inutile maintenant (YAGNI).
**Alternatives :** inférence payée par la plateforme — bien moins de friction et plus
grand public, mais nécessite pricing/quotas/anti-abus. Meilleur choix *si* cible
grand public un jour.
**Note :** abonnements grand public ≠ accès API. Clés chiffrées au repos, usage
serveur uniquement.

## 2026-07-17 — Multi-utilisateurs dès le jour 1
**Décision :** multi-users via Supabase Auth dès le départ.
**Pourquoi :** vrai travail comptes/auth (cible d'apprentissage) plutôt qu'un
rétrofit plus tard.

## 2026-07-17 — Autorisation via scoping serveur, RLS optionnel plus tard
**Décision :** autorisation principale = scoping des requêtes à l'user connecté côté
serveur. RLS = défense en profondeur optionnelle pour plus tard.
**Pourquoi :** Prisma utilise une connexion privilégiée qui contourne le RLS ; le
scoping serveur colle au mental model Rails et garde la friction basse.
**Alternatives :** RLS comme garde principal (propre en pur Supabase-client, mais
bancal combiné à Prisma).

## 2026-07-17 — Recettes : génération à la demande + stockage des validées ; seed initial
**Décision :** le bot génère depuis le modèle ; les recettes validées sont stockées.
~10 recettes seed (healthy/sport) pour que l'app ne soit jamais vide. Seed et
générées dans la même table.
**Pourquoi :** variété de la génération + fiabilité du stockage ; le livre grandit
naturellement au fil des validations.
**Alternatives :** génération pure sans persistance (coûteux, non reproductible) ;
base 100% manuelle (fiable mais variété limitée, lourde à seeder).
**Note :** macros = **estimations** au MVP (potentiellement hallucinées). OK pour
l'instant ; à durcir via source nutritionnelle si la précision protéines devient
critique.

## 2026-07-17 — Préférences : stockage structuré, injection en langage naturel, captage ambiant via tool calling
**Décision :** préférences stockées en lignes typées ; rendues en langage naturel et
injectées à chaque prompt (modèle sans mémoire). Captage **ambiant** via **tool
calling** (le modèle demande un `save_preference(...)`, exécuté/validé côté serveur).
Révisables dans un écran "Ce que le chef sait de moi" plutôt que confirmées d'avance.
`type` ouvert et large (goûts, aversions, contraintes, garde-manger, occasions,
objectifs).
**Pourquoi :** structuré pour la rigueur, naturel pour la compréhension du modèle,
ambiant pour un ressenti d'ami/coach. Coût tokens négligeable.
**Exception :** contraintes dures (allergies/intolérances) confirmées explicitement
et toujours respectées — sécurité avant fluidité.
**Contraste :** la création de recette reste en confirmation explicite ("ok") ; seul
le captage de préférence est ambiant.

## 2026-07-17 — Notation des recettes
**Décision :** notes 0–3 étoiles + flag favori sur la jointure `UserRecipe`.
**Pourquoi :** signal léger "aime un peu / beaucoup" ; pourra nourrir la
personnalisation plus tard.

## 2026-07-17 — Nom du projet : FitBatchCooker (domaine fitbatchcooker.com)
**Décision :** nom affiché **FitBatchCooker** (constante `APP_NAME`) = domaine
**`fitbatchcooker.com`** (dispo, `.com`). Nom et domaine identiques.
**Pourquoi :** cohérence nom = domaine + clarté maximale (fit + batch + cooker dit
tout, même à un inconnu) + bon SEO. La longueur est un détail mineur face à la
clarté. Colle à l'ADN : batch cooking orienté fitness/prise de masse.
**Alternatives :** FitBatch court (mais dissocié du domaine, moins clair), Batchef,
Protiq (cher), Bento (saturé).

## 2026-07-17 — Mobile : responsive maintenant, natif seulement si ça décolle
**Décision :** responsive/mobile-first dès le départ (gratuit) ; PWA possible plus
tard ; natif (React Native/Expo) seulement si le produit décolle.
**Pourquoi :** on ne convertit pas Next → natif (UI à réécrire), mais le backend
Supabase est réutilisable. Seule discipline dès maintenant : séparer logique
métier/données de l'UI. YAGNI pour le reste.

## 2026-07-17 — Objectif protéines personnalisé (par utilisateur)
**Décision :** l'objectif protéines quotidien est **propre à chaque user**, calculé
depuis son poids (2 g/kg). On stocke le poids (ou une cible directe) dans le profil.
**Pourquoi :** dépend du corps de chacun ; le "120 g" est l'exemple perso de
l'auteur, pas une valeur globale.

## 2026-07-17 — Apprentissage IA : tool calling → actions → MCP (progressif)
**Décision :** faire de l'intégration IA un objectif d'apprentissage progressif —
tool calling (le bot crée la donnée) au MVP, puis actions, puis MCP (services
externes) plus tard.
**Pourquoi :** l'auteur veut comprendre comment on intègre l'IA aujourd'hui, sans
être noyé dès le départ.

## 2026-07-17 — Multilingue : habitude maintenant, i18n complet plus tard
**Décision :** contenu IA multilingue gratuit (langue de l'user dans le prompt) ;
pour l'UI, centraliser les textes dès le départ (pas de string en dur), brancher une
lib i18n (next-intl) seulement quand une 2ᵉ langue est un vrai besoin.
**Pourquoi :** même logique que le mobile — une bonne habitude d'archi maintenant
évite un rétrofit pénible ; le reste = YAGNI.

## 2026-07-17 — Prisma 7 : driver adapter + connexions poolée/directe séparées
**Décision :** Prisma 7 (sans moteur Rust). Runtime = `@prisma/adapter-pg` sur la
connexion **poolée** (`DATABASE_URL`, :6543). Migrations CLI = connexion **directe/
session** (`DIRECT_URL`, :5432) via `prisma.config.ts`. Le champ `directUrl` n'existe
plus.
**Pourquoi :** Prisma 7 a supprimé `directUrl` et impose un driver adapter ; c'est le
montage correct pour Supabase en serverless. Raffine la §9 de la spec.
**Alternatives :** ancien `url` + `directUrl` dans `schema.prisma` — obsolète en v7.

## 2026-07-17 — Workflow Git : branche main seule + commits gitmoji
**Décision :** une seule branche `main` (= prod). Pas de `staging` : on s'appuie sur
les Preview Deployments Vercel (une URL par branche/PR). Commits petits, en anglais,
gitmoji, auteur Maxime, sans trailer IA.
**Pourquoi :** Vercel fournit un "staging" jetable par branche → une branche partagée
n'apporte rien (KISS). Petits commits = historique clair.
**Alternatives :** flow main+staging (utile seulement si un env partagé stable devient
un vrai besoin).

## 2026-07-17 — Doc à jour via Context7 (plugin MCP)
**Décision :** ajout du plugin Context7 pour injecter la doc versionnée des libs.
**Pourquoi :** stack neuve + libs qui bougent vite (cf. piège Prisma 7) ; évite les
conventions obsolètes, couvre Prisma/Supabase/Next d'un coup.
**Alternatives :** skills par techno (redondantes) ; se reposer sur `llms.txt`/WebFetch
(filet gratuit mais moins automatique).

## 2026-07-17 — Déploiement sur Vercel (auto depuis main)
**Décision :** app en ligne sur Vercel (`https://fitbatchcooker.vercel.app`), auto-deploy
depuis `main` (prod) + une preview par branche/PR. Variables `DATABASE_URL`/`DIRECT_URL`
en Production & Preview ; Node figé en `24.x` (`engines.node`). Build = `prisma generate
&& next build` — **les migrations restent hors du build**.
**Pourquoi :** premier résultat en ligne, palpable et motivant ; CI/CD gratuit et aligné
sur le workflow branche `main` + previews.

## 2026-07-17 — Base Supabase partagée dev/prod (temporaire)
**Décision :** une seule base Supabase pour le dev local **et** la prod, pour l'instant.
**Pourquoi :** simplicité maximale pour le MVP perso ; `migrate dev` en local suffit à
mettre la "prod" à jour. Assumé comme **provisoire**.
**Alternatives :** bases séparées (2ᵉ projet Supabase ou branching) + un GitHub Action
`prisma migrate deploy` comme étape de release dédiée — à faire quand le risque grandit
(vrais utilisateurs, données à préserver). Suivi dans `PROD_CHECKLIST.md`.

## 2026-07-20 — Auth : confirmation email désactivée en dev (temporaire)
**Décision :** authentification via **Supabase Auth** (`@supabase/ssr`, cookie-based),
email/mot de passe. **Confirmation par email désactivée** le temps du dev.
**Pourquoi :** signup/login immédiat, sans aller-retour mail → itération rapide sur le MVP.
**Alternatives :** garder la confirmation dès maintenant (plus réaliste mais friction en dev).
**À faire avant prod :** réactiver la confirmation — suivi dans `PROD_CHECKLIST.md`.

## 2026-07-20 — Tests : optionnels, ciblés logique métier + sorties IA
**Décision :** pas de suite de tests systématique. On testera **la logique métier pure**
et **la validation des sorties du modèle IA** (tool calling) ; le reste s'appuie sur
TypeScript + la boucle de vérif (types + runtime + curl). Vitest sera introduit au moment
du bot.
**Pourquoi :** priorité = développer et voir des concepts. Les types couvrent déjà une
grande partie de ce qu'on testerait en Ruby ; tester le CRUD trivial ou le framework =
faible valeur.
**Alternatives :** TDD/tests systématiques façon Rails — écarté ici (friction vs objectif
d'apprentissage).

## 2026-07-20 — Sécurité du bot IA : posture et garde-fous
**Décision :** endpoint chat **authentifié** + clé **serveur-only** (déjà en place).
Règle d'or du tool calling : le `userId` vient **toujours de la session**, jamais des
arguments proposés par le modèle ; **chaque entrée d'outil validée (Zod)** avant écriture ;
**outils étroits** (le modèle ne fait que ce qu'on définit, pas de SQL arbitraire) ;
`maxOutputTokens` + `maxSteps` pour plafonner coût et boucles. Backstop : **budget cap
mensuel OpenAI + auto-recharge désactivée** (en place).
**Pourquoi :** le modèle est non fiable (prompt injection) et l'API est payante (clé
partagée aujourd'hui) → défense = validation serveur + plafonds + isolation de l'autorité
(l'autorisation ne dépend jamais du modèle).
**Reporté (voir `PROD_CHECKLIST.md`) :** rate limiting par user, signups restreints,
BYO-key par user.

## 2026-07-20 — Recentrage produit : planification gamifiée en amont (pas un tracker)
**Décision :** le cœur du produit devient la **planification en amont, gamifiée** :
l'user compose plusieurs jours de repas et remplit une **jauge de protéines** par jour
(objectif 2 g/kg) jusqu'au « vert » ; sortie = un **quota de batch** (plats à cuisiner
d'avance, en parts/jours). L'ancienne « semaine type » **devient** ce cœur. Modèles
`MealPlan` + `PlanEntry` (remplacent WeeklyPlan/PlanEntry).
**Pourquoi :** différenciant et fidèle à l'ADN batch cooking ; le plaisir est dans la
composition de la période, pas dans un suivi quotidien (moins de friction, plus ludique).
**Alternatives :** tracker quotidien — rejeté (plus contraignant, moins fun, hors ADN).

## 2026-07-21 — Performance : région, dédup des appels, feedback UI
**Décision :** (1) fonctions Vercel épinglées à **Francfort (`fra1`)** via `vercel.json`,
collées à la base Supabase (eu-central-1) — avant : défaut `iad1` (US), chaque requête
traversait l'Atlantique. (2) `getCurrentUser` enveloppé dans **`cache()` de React**
(dédup par requête : layout + page + action = 1 appel) et **lecture avant écriture**
(`findUnique` puis `create` si absent, au lieu d'un `upsert` qui écrivait à chaque visite).
(3) Feedback UI : **`loading.tsx`** (skeletons Suspense) + **`useFormStatus`** (bouton
désactivé pendant l'action) + **`useOptimistic`** (toggle sauvegarde instantané).
**Pourquoi :** en prod l'app était lente ; le symptôme du double-clic venait de l'absence
de feedback, la lenteur brute surtout du décalage de région et des appels/écritures répétés.
**Alternatives / reporté :** optimiser davantage la latence si besoin (moins d'allers-retours
séquentiels) ; optimistic sur la liste `/book` (plus complexe, gain faible — YAGNI).

## 2026-07-24 — Principe fondateur : régularité > précision (+ `PRINCIPLES.md`, `DESIGN.md`)
**Décision :** acter que l'app vise la **régularité long terme** (plusieurs mois), pas la
précision d'un jour. L'**approximation est un choix de design**. Le modèle protéines reste
grossier : un ingrédient = **protéines/100 g + quantité habituelle** saisies à la louche →
**protéines/part** dérivées ; **pré-remplies par l'IA** (le chef doit être bon pour éviter de
repasser derrière), ajustables à la volée. Deux nouveaux docs : `PRINCIPLES.md` (principes +
règles métier) et `DESIGN.md` (direction artistique), pour la cohérence entre sessions.
**Pourquoi :** en prise de masse, ce sont la régularité et le plaisir qui produisent les
résultats ; viser la précision (%, pesée) serait une fausse rigueur qui décourage. L'app doit
**simplifier**, gamifier, aller vite.
**⚠️ À valider ensemble avant construction :** l'ergonomie du modèle ingrédient/part est le
**socle du sens de l'app** — point de validation dédié avant la Phase D.

## 2026-07-24 — Encas = `Recipe.kind` (pas d'entité séparée) ; chantier recettes phasé A→D
**Décision :** les encas/compléments (skyr, noix, tartine PB) sont des **`Recipe` avec
`kind = SNACK`**, pas une table à part. Chantier « recettes riches » séquencé : **A** page
détail, **B** encas (`kind` + onglets palette + seed), **C** images (Supabase Storage), **D**
couche ingrédients (différée). Détail dans `ROADMAP.md`.
**Pourquoi :** drag/jauge/`BatchEntry`/quota marchent déjà avec `Recipe` → zéro duplication
(KISS). Modèle unifié, l'UI étiquette « Recettes / Encas ». Ingrédients repoussés car le batch
n'a besoin que de **protéines/part** — la couche ingrédients ne fait que *dériver* ce nombre.
**Alternatives :** table `Snack` séparée (duplication inutile) ; couche ingrédients tout de
suite (sur-ingénierie avant que la précision/les courses soient un besoin réel).

## 2026-07-24 — Mobile-first / tap-first élevé au rang de principe
**Décision :** l'usage **mobile** (composer sa semaine depuis le canapé) est un objectif de
base, pas une option. Élevé en principe (`PRINCIPLES.md` §5) : **mobile-first + tap-first**
(aucune action clé réservée au drag & drop ; drag = confort desktop). Reste **web** :
responsive maintenant → PWA possible → natif seulement si ça décolle (backend Supabase
réutilisable dans tous les cas).
**Pourquoi :** c'est le contexte d'usage réel visé ; web responsive + PWA couvre le « sors
ton tél et joue » sans le coût/réécriture d'un natif. Confirme et hausse la §7bis de la spec
et la décision mobile du 2026-07-17.
**Risque surveillé :** drag & drop tactile fragile → garantir un chemin **tap** pour chaque
action (suivi dans `ROADMAP.md`).

## 2026-07-24 — Phase A livrée + composeur poli (aperçu, chips unifiés, mobile v1)
**Décision :** livrer la **page détail recette** (`/recipes/[id]`) et polir le composeur.
Rendu recette factorisé dans un **`RecipeDetail` partagé** (page + **modale d'aperçu** dans le
composeur). Un seul **`RecipeChip`** pour la palette et les jours (même design). **Dialog
shadcn/Radix** (nouvelle dépendance `@radix-ui/react-dialog`), centré en flex pour laisser le
`transform` libre à l'animation ; la modale **jaillit depuis la carte** cliquée (vars CSS
`--dx/--dy`). **Mobile v1** : `MouseSensor` + `TouchSensor` (drag tactile = appui-maintenu, le
swipe scrolle), **tap-to-add** (« + » → « ajouter à quel jour ? »), actions visibles au doigt.
**Pourquoi :** une seule source de vérité pour l'affichage recette ; tap-first non négociable
(`PRINCIPLES.md` §5) → le drag ne peut pas être l'unique chemin sur mobile.

## 2026-07-24 — Page « Mon compte » (auth self-service)
**Décision :** page **`/account`** (« Mon compte », renommée depuis `/profile`) avec **email
connecté visible**,
**changement d'email** (via `supabase.auth.updateUser` → mail de confirmation, non instantané)
et **changement de mot de passe** exigeant la **re-vérification du mot de passe actuel**
(`signInWithPassword`) avant modification. `getCurrentUser` **resynchronise** `User.email`
depuis Supabase Auth (source de vérité) en cas de drift.
**Pourquoi :** un incident réel (« mes données ont disparu » = en fait connecté sur un autre
compte) a montré le besoin de voir clairement son compte et de gérer ses identifiants. La
re-auth avant changement de mot de passe évite qu'une session laissée ouverte le change.
**Différé :** **suppression de compte** (destructif + nécessite la service-role key serveur).

## 2026-07-24 — App multilingue (FR/EN) via next-intl, sans préfixe d'URL
**Décision :** internationaliser l'app avec **`next-intl`**, **sans préfixe de locale dans
l'URL** (`localePrefix: "never"`, à la YouTube) : **défaut anglais** (langue pivot), et la
langue est déduite du cookie `NEXT_LOCALE` puis de l'`Accept-Language` du device (détection
auto → un device FR tombe en français **aux mêmes URLs propres**). Précédence : choix
explicite (cookie) > device > défaut. Routes sous **`app/[locale]/`** (segment rewrité en
interne par le middleware, invisible dans l'URL), textes migrés de `lib/strings.ts`
(supprimé) vers des **catalogues ICU** `messages/fr.json` + `en.json`. **Sélecteur de langue**
dans le chrome (à côté du thème). **Middleware** = next-intl **puis** refresh de session
Supabase (cookies greffés sur la même réponse). **404 localisé** via catch-all `[locale]/
[...rest]` → `notFound()`. Le **chef IA** répond dans la langue active (cookie `NEXT_LOCALE`).
**Pourquoi :** URLs propres façon app grand public (choix assumé après avoir comparé à la
voie « URLs par langue »). Le socle `lib/strings.ts` centralisé rendait la bascule peu
coûteuse. Livré en **branche + PR** (première PR du projet).
**Trade-off assumé (réversible) :** SEO par langue faible + pas de lien partageable par
langue — non pertinent maintenant (app perso, derrière auth). Le jour où le SEO comptera
(une **landing**), on repassera en `as-needed` **sélectivement** sur ces pages (juste un flag).
**À revoir :** renommer `middleware.ts` → `proxy.ts` (déprécation Next 16) ; métadonnées
`title`/`description` non encore localisées.

## 2026-07-25 — Cœur produit : ingrédients partagés + recettes per-user
**Décision :** deux couches distinctes. **Ingrédients GLOBAUX** (un catalogue unique : nom,
catégorie+picto, `proteinPer100g` ~objectif, dédupliqués par `normalizedName`), réutilisés
par toutes les recettes et tous les users ; le chef lit l'existant avant d'en créer.
**Recettes PER-USER** via `Recipe.userId` **nullable** : `NULL` = **bibliothèque partagée**
(contenu curé qui peut grandir), non-null = recette de l'user ; navigation =
`where OR [userId=moi, null]`. **2 axes orthogonaux** : `Recipe.userId` = propriété ;
`UserRecipe` = sauvegardé/favori (« mon livre ») — on garde les deux. **1 recette = 1 part**
(pas de `servings` ; pour manger plus, poser le plat plusieurs fois dans un jour).
**Protéines/part dérivées** des ingrédients mais **mises en cache** dans
`Recipe.proteinPerServingG` (recalculées à chaque write via `recomputeRecipeProtein`) → le
composeur de batch (chemin chaud) lit la colonne, inchangé. Création : **manuelle**
(`/recipes/new`) **et par le chef** (`create_recipe`, confirmation explicite). Navigation :
filtres + **scroll infini** (curseur). **Seed recherché** (44 ingrédients + 19 recettes,
protéines croisées Ciqual/USDA).
**Pourquoi :** réconcilie partage (protéine ~objective → globale) et personnalisation
(recettes = mienne vs bibliothèque). Le cache protéine garde la jauge rapide sans dupliquer
la logique. `userId` nullable **pour toujours** = sentinelle « bibliothèque », visibilité en
requête et non en colonne `NOT NULL`.
**Contenu recettes en français** (la parité bilingue stricte = UI/`messages` seulement).
**Différé :** communauté/partage, upload d'images, édition `proteinPer100g`, liste de courses.

## 2026-07-25 — Affinages cœur produit (retours d'usage)
Évolutions du socle ci-dessus après premier usage :
- **Catalogue d'ingrédients VERROUILLÉ** (seed only) : ni le chef ni le formulaire ne créent
  d'ingrédient — ils ne piochent que dans l'existant (un nom inconnu proposé par le chef est
  rejeté, pas créé). On étoffe le seed (~80 ingrédients) au lieu d'ouvrir la création.
  **Pourquoi :** l'ingrédient est partagé par tous → éviter la pollution/les doublons de la base.
- **Catégorie `CONDIMENT`** (huile, sel, poivre, sauce soja, miel…) remplace `FAT` (supprimée) ;
  avocat → `VEGETABLE`. Basiques = supposés dispo, rangés à part.
- **Deux listes distinctes** : `/recipes` = **bibliothèque partagée** (découverte + bookmark,
  non modifiable) ; `/book` (« Mes recettes ») = **livre** = recettes sauvegardées + créées
  (auto-sauvegardées). Le bouton « Nouvelle recette » vit sur `/book`. La **palette du batch =
  le livre**. On a retiré le filtre « mine » (propriété) devenu source de confusion.
- **Suppression de `servings`** (Recipe + BatchEntry) : 1 entrée = 1 part. Manger à plusieurs =
  poser le plat N fois dans un jour, **affiché groupé en ×N** (comme le bloc « à cuisiner »).
- **Page ingrédients = recherche inversée** (façon Marmiton) : cliquer un ingrédient ouvre les
  recettes qui l'utilisent (bookmark + scroll infini). Pas d'édition (base partagée).

## 2026-07-25 — Retours d'usage (round 2)
- **Pivot : un seul onglet « Recettes »** (fin de `/book`). La page montre **public + mes
  recettes** (scopé, jamais celles d'un autre user) avec un **filtre « Favoris »** (= lignes
  `UserRecipe`). La palette du batch utilise la même source + le même filtre → **plus jamais
  vide** au 1ᵉʳ usage. Distinction publique/perso conservée en base (`Recipe.userId`),
  transparente pour l'user. **Pourquoi :** le split biblio/livre rendait la palette vide au
  départ et « Mes recettes » vs « Recettes » était confus.
- **Picto par ingrédient** : colonne `Ingredient.picto` semée par un emoji best-fit (map
  nom→emoji dans le seed) ; fallback sur le picto de catégorie. **Pourquoi :** un picto par
  catégorie montrait du riz pour des pâtes, du sel pour de l'huile.
- **Objectif protéines dérivé du poids** : on capture le **poids** au profil → **~2 g/kg**
  (friction minimale) ; un **switch « objectif personnalisé »** override (implicite : `on`
  ssi `proteinTargetG` non-null, pas de colonne en plus). **Pourquoi :** sans objectif, les
  jauges restaient à 0 (`dayProgressPct` → 0) et semblaient cassées.
- **Barre de progression du batch continue** : **somme de toutes les protéines / objectif
  total** (`cible × jours`) au lieu de `jours_verts / jours` → elle avance **à chaque plat**,
  en un coup d'œil. La barre plafonne à 100 % mais le libellé montre le vrai total (« 228 /
  200 g », teinté quand on dépasse). Choix assumé : simplicité/lisibilité plutôt qu'une
  formule par jour (un gros jour peut « masquer » un jour vide — acceptable ici).
- **Bug favori corrigé** : `SaveToggle` possède son état (`useState`) — un `useOptimistic`
  retombait sur un prop figé par le `useState(initialRecipes)` de la liste (favori qui ne
  « prenait » qu'au reload).
- **Images (chat + recettes) : différées** ; approche prévue = génération IA + cache Supabase
  Storage (bucket + `SUPABASE_SERVICE_ROLE_KEY` à provisionner), ~1-4 ¢/image.

## 2026-07-25 — Modale recette + catalogue d'ingrédients élargi
- **Fiche recette en modale** depuis la liste `/recipes` (routes parallèles `@modal` +
  interception `(.)[id]`) : la liste reste montée dessous → **filtres + scroll préservés**
  (« pour pas perdre le fil »). Lien « page complète » dans la modale ; lien direct / refresh
  / partage → page autonome. Fetch mutualisé dans `recipe-detail-data.ts`. **Pourquoi :**
  ouvrir une recette puis revenir perdait les filtres sélectionnés.
- **Catalogue d'ingrédients élargi (~157) et généralisé** : noms génériques (« Champignons »
  au lieu de « Champignons de Paris », « Bœuf »/« Porc », « Tortilla »…) pour qu'une entrée
  couvre plusieurs recettes ; gros ajout de **fruits** + légumes/poissons/fromages/féculents/
  légumineuses/oléagineux, valeurs protéiques de référence. Le seed **purge les ingrédients
  renommés/retirés** non référencés. **Unité œuf en grammes conservée** pour le MVP (compteur
  d'unités reporté). **Cap : on arrête le polish de cette feature ici**, place au reste du MVP.

## 2026-07-25 — Retours d'usage (round 3) : modale de retour, filtres multi-select
- **La modale recette revient — mais en état client**, pas en route interceptée. Le premier
  essai (`@modal` + `(.)[id]`, cf. entrée précédente) jetait des 500 « Invalid interception
  route » sous le segment `[locale]` : supprimé en `8418a95`. La v2 est un simple Radix
  Dialog piloté par `useState` dans `RecipeBrowser` — même pattern que la modale ingrédients,
  qui elle n'a jamais bronché. **Pourquoi :** on perd le lien profond « URL = modale ouverte »,
  mais on gagne un truc qui ne casse pas ; l'interception de route reste un piège tant que
  Next ne la gère pas proprement sous un segment dynamique de locale.
- **La carte reste un vrai `<a>`** : on n'intercepte que le clic gauche simple. Cmd/Ctrl-clic,
  clic milieu et « ouvrir dans un nouvel onglet » atteignent toujours la page autonome.
- **Filtres type de repas en multi-select** (`mealTypes[]` → `{ mealType: { in: [...] } }`),
  « Tous » = vider la sélection. Chips passées à 44 px : on tape beaucoup plus dessus.
- **Filtres transmis par `?from=`** de la modale vers la page recette, puis re-sérialisés par
  la page pour bâtir son lien retour. `filter-params.ts` est la source unique de cet encodage
  et **valide par whitelist** : un `?from=` bricolé retombe sur `/recipes` nu.
- **`SaveToggle` gagne un `onToggle`** : un favori coché dans la modale met à jour la carte
  derrière. La liste fige ses lignes dans un `useState`, donc `revalidatePath` ne l'atteint
  jamais (même racine que le bug favori du round 2).
- **Hydration mismatch sur `<body>`** : c'était une **extension navigateur**
  (`cz-shortcut-listen`) qui écrit dans le DOM avant React, pas notre code →
  `suppressHydrationWarning` sur `<body>`.
- **Le Retour navigateur ferme la modale.** Ouvrir la modale **pousse une entrée
  d'historique jetable** (même URL, un simple marqueur dans `history.state`) ; un
  `popstate` la referme. Fermer autrement (Échap, backdrop, croix) **consomme** cette
  entrée via `history.back()`, sinon il faudrait deux Retour pour quitter la liste. Le lien
  « page complète » utilise `replace` pour prendre la place de l'entrée jetable.
  **Pourquoi :** sur mobile, Retour = fermer la modale, c'est le réflexe. On récupère ce que
  la route interceptée offrait gratuitement, sans son fragile.

## 2026-07-26 — Recalage du ROADMAP sur le code réel
- **`MealType` a absorbé le `Recipe.kind` prévu.** La « Phase B — encas » devait ajouter un
  champ `kind` (`MAIN`|`SNACK`) ; le code a livré un **`MealType`** à trois valeurs
  (`MAIN`|`SNACK`|`BREAKFAST`). **Pourquoi :** le petit-déj est un troisième cas légitime,
  et une seule dimension « type de repas » évite deux champs qui disent presque la même chose.
- **La « Phase D — couche ingrédients », notée différée, était en fait construite** :
  protéines/part **dérivées** des ingrédients et remplies par l'IA sur catalogue verrouillé.
  Le point de validation prévu avant de la bâtir n'a jamais eu lieu — elle s'est faite en
  chemin. **Il reste ce qu'elle débloque** : liste de courses, scaling.
- **Reste vraiment à faire côté « recettes riches »** : les **images** (Phase C, rien de
  commencé) et le **filtre par type dans la palette du composeur** (la page `/recipes`
  filtre, la palette non).
- **On commite directement sur `main`** (retour au rythme des débuts du projet). Solo dev,
  MVP non-prod : la cérémonie branche/PR et l'isolation en worktree ne protègent personne.
  Le **worktree reste dans la boîte à outils pour ce à quoi il sert vraiment** — l'isolation
  quand plusieurs agents/jobs écrivent en parallèle — pas pour le travail courant.
  `.claude/settings.json` reste à la **config Claude par défaut** (pas d'override).
- **« Ajouter à mon batch » depuis les cartes recettes : écarté.** On n'en veut pas pour
  l'instant ; l'ajout se fait uniquement depuis le composeur. Déplacé en « Plus tard ».

## 2026-08-08 — Mot de passe oublié + on reste sur Supabase (pas de Neon)
- **Flow « mot de passe oublié » livré** : `/forgot-password` → email → `/api/auth/callback`
  (échange du `code` PKCE contre une session) → `/reset-password`. **Pourquoi ces choix :**
  - **Callback sous `/api`** : le proxy next-intl ne réécrit pas les routes `/api` (pas de
    segment `[locale]` à gérer).
  - **Réponse neutre** sur `/forgot-password` (« si un compte existe… ») : anti-énumération,
    on ne révèle jamais quels emails ont un compte.
  - **Pas de re-vérif de l'ancien mot de passe** (contrairement à `/account`) : le lien email
    EST la preuve d'identité. La page exige une session (créée par le callback) ; sans
    session = lien invalide/expiré.
  - **Caveat assumé** : PKCE **même appareil** (demande + clic depuis le même navigateur) ;
    cross-device = durcissement post-MVP.
  - **Config Supabase** : les Redirect URLs doivent lister `…/api/auth/callback` (localhost +
    Vercel), sinon Supabase retombe sur la Site URL. Allow-list = **moindre privilège** (URL
    exacte, pas de `/**`).
- **Évalué Neon, on reste sur Supabase.** **Pourquoi :** Supabase = Postgres **+ Auth**,
  Neon = Postgres seul. Migrer casserait toute l'auth (login/signup/reset/sessions) sans
  régler le besoin réel (isoler dev/prod côté données) — qui resterait de toute façon sur
  Supabase pour l'auth. Séparation dev/prod le jour venu : 2ᵉ projet Supabase gratuit (dev)
  ou Branching (Pro). Stack `CLAUDE.md` réaffirmée.

## 2026-08-08 — Catalogue d'ingrédients bilingue (157 → 420)
- **Le bug de la démo n'était pas un catalogue maigre, mais un catalogue MONOLINGUE.** Le chef
  répondait en anglais, proposait `Olive oil`/`Garlic`/`Cream`/`Parmesan` — tous **présents** en
  base sous leur nom français — et `create_recipe` les rejetait, la résolution ne connaissant que
  `normalizeName(nom français)`. Vérifié ligne à ligne avant de coder.
- **Bilingue PAR COLONNE, pas par ligne** : une seule ligne porte `nameFr` + `nameEn`, donc un
  `RecipeIngredient` pointe toujours vers UN ingrédient quelle que soit la langue du lecteur.
  Deux clés normalisées **uniques** (`normalizedNameFr`, `normalizedNameEn`) ; les outils du chef
  résolvent avec un `OR` sur les deux. **Priorité FR** dans la map de résolution.
  *Écarté :* un `searchKeys String[]` (Prisma ne sait pas faire de `contains` sur une liste
  scalaire, il aurait fallu du SQL brut) et une table de noms (un seul espace de clés global
  casserait les ~62 entrées où FR == EN : Parmesan, Quinoa, Chorizo…).
- **Rename `name` → `nameFr` assumé** plutôt qu'un simple ajout de `nameEn` : le rename transforme
  tout site d'affichage oublié en **erreur `tsc`** au lieu d'un français affiché en silence — la
  classe de bug qu'on corrigeait. Le compilateur a listé les 14 sites, tous traités.
- **Bug évité au passage** : avec deux langues, un modèle proposant `Ail` ET `Garlic` créait deux
  liens vers le même ingrédient → violation de `@@unique([recipeId, ingredientId])`. `create_recipe`
  **résout d'abord, fusionne les quantités par `ingredientId`** ensuite.
- **Migration en deux temps** sur la base partagée : M1 (RENAME COLUMN + colonnes EN nullables) →
  `db seed` (backfill) → M2 (NOT NULL + index unique, avec une garde SQL qui explique quoi faire).
  `migrate deploy` et non `migrate dev`. Fenêtre de ~4 min assumée (solo, pas d'utilisateurs) ;
  l'alternative expand/contract est notée pour le jour où il y en aura. Rollback dans le commit.
- **Seed rendu non destructif d'abord** (commit séparé) : il supprimait les recettes bibliothèque,
  ce qui cascade sur `BatchEntry`. Vérifié en conditions réelles — 19 recettes, 38 entrées de batch,
  dont 9 recettes référencées : ids identiques avant/après reseed.
- **`picto` intégré à l'entrée**, `PICTO_BY_NAME` supprimée : une map keyée par nom n'a plus de
  langue évidente et échouait **en silence** sur une faute de frappe. Le seed **refuse de tourner**
  si un nom EN est le nom FR d'une autre entrée (collision invisible en relecture, corruption
  silencieuse de la catégorie et des protéines).
- **Anglais américain** (Zucchini, Eggplant, Arugula, Cilantro) : meilleure reconnaissance et
  registre par défaut du modèle. Faux amis figés dans un test : `Raisin`→Grapes / `Raisins secs`→
  Raisins, `Prune`→Plum / `Pruneaux`→Prunes, `Poivre`→Black pepper / `Poivron`→Bell pepper,
  `Bar`→Sea bass. **Aucun nom FR existant renommé** (sinon orphelins en base).
- **Langue du chef = celle de l'utilisateur, pas seulement l'UI (option C).** Le prompt suit
  la langue du **dernier message** ; repli sur la locale de l'UI si le message est trop
  court/ambigu. **Pourquoi :** un user qui écrit en FR veut une réponse FR même si l'UI est en
  EN (l'option « toujours l'UI » s'est révélée trop rigide en test). Détail technique : la route
  `/api/chat` vit hors du segment `[locale]` → elle ne connaît pas la locale ; le **client
  l'envoie** dans le body (`useLocale`), et le prompt suit la langue du message. Erreurs d'auth
  Supabase désormais **traduites** (`login/actions.ts`, seul endroit qui affichait du brut).

## 2026-08-10 — Onboarding : écran de bienvenue, empty state, visite guidée

- **Le vrai blocage était une donnée manquante, pas un manque d'explications.** Sans poids,
  `dailyProteinTargetG()` renvoie `null` → toutes les jauges à 0 → aucun jour scellé au vert
  possible, donc **aucune activation**. On répare la cause (écran de bienvenue) avant de faire
  visiter l'app. La bulle « règle ta cible » prévue dans la visite a donc disparu : on enseigne
  le résultat, pas le menu.
- **Zéro migration, zéro colonne.** Le premier jet ajoutait `onboardedAt` + `tourSeenAt`. Les deux
  sont inutiles : `signup` **redirige** vers `/welcome` (l'écran n'est pas une garde sur l'app,
  donc rien à mémoriser), la visite est armée **uniquement** par `?tour=1`, et la relance « règle
  ta cible » se déduit de `dailyProteinTargetG(user) === null` — la condition **est** l'état
  produit réel, et elle se résout d'elle-même. Règle générale : avant d'ajouter une colonne pour
  un état, vérifier s'il n'est pas déjà déductible de la donnée existante (sinon = deux sources à
  garder cohérentes).
  - Effets de bord évités : aucune décision sur la base Supabase partagée dev/prod, aucun compte
    existant impacté, et **les 15 tests e2e existants passent sans modification** (ils ne visitent
    jamais une URL portant `?tour=1`).
  - Pas dans la table `Preference` non plus : `lib/ai/chef.ts` injecte **toutes** les préférences
    dans le prompt du chef — un flag technique y finirait en phrase adressée au modèle.
- **`@base-ui/react` plutôt qu'une lib de visite.** Déjà installé, et déjà la lib de primitives du
  projet (`components/ui/button.tsx` est construit dessus) → **0 nouvelle dépendance, 0 ligne de
  CSS**, dark mode gratuit via les tokens. **Shepherd.js et Intro.js écartés pour la licence :**
  tous deux passés en **AGPL-3.0** dual-license, licence commerciale payante obligatoire pour un
  SaaS générant du revenu. driver.js (MIT, très bon) aurait imposé ~110 lignes de surcharges CSS
  tierces, des `z-index` à 10000+ hors de la convention plate `z-50`, et des boutons vendor à
  13 px (viole les 44 px de PRINCIPLES §5).
- **Voile `pointer-events-none`, `modal={false}`, pas de `Popover.Backdrop`.** Rien de ce que rend
  la visite ne peut avaler un tap → le scroll mobile survit et le `TouchSensor` du composeur est
  intouché. Vérifié dans `node_modules` : scroll lock et backdrop interne sont tous deux gatés sur
  `modal === true`.
- **Ancrage responsive** : les deux navs (sidebar desktop `hidden md:flex` + bande mobile) sont
  dans le DOM en même temps. La visite résout la cible avec `checkVisibility()` (et non
  `offsetParent`, qui est aussi `null` pour un élément `position:fixed` visible). Validé en 375 px :
  c'est bien la bande mobile qui est ciblée.
- **La visite se ferme sur tout clic extérieur** (en plus de Passer/Terminé et Échap) : l'utilisateur
  qui reprend la main gagne toujours, et c'est rejouable depuis `/account`. Conséquence utile : comme
  toute server action de la page exige un tel clic, un `revalidatePath` ne peut jamais atterrir
  pendant que la visite est ouverte. Le composant est quand même rendu **inconditionnellement** avec
  `autoStart` figé dans un `useState` (défense en profondeur contre un démontage en cours de route).
- **`?tour=1` nettoyé au démarrage** via `history.replaceState` (pas `router.replace`, qui
  refetcherait l'arbre RSC) : un rechargement ne rejoue pas et l'URL reste propre.

## 2026-08-10 — Deux correctifs sur l'onboarding

- **Un lien stylé en bouton reste un lien.** `<Button render={<Link/>} nativeButton={false}>` faisait
  annoncer « bouton » par un lecteur d'écran pour un `<a href>` qui navigue : `useButton` applique
  `role: 'button'` **inconditionnellement** dès que `nativeButton` est faux, sans échappatoire — son
  propre warning dev nomme d'ailleurs ce `role` comme un attribut « unintended ». Remplacé par
  `components/button-link.tsx` : un vrai `<Link>` stylé par `buttonVariants`. On récupère au passage
  ce que le navigateur offre gratuitement à un lien (Entrée, clic milieu, cmd-clic, « ouvrir dans un
  nouvel onglet », « copier l'adresse »). Appliqué aux 4 sites d'appel. Gardé par un test dans
  `e2e/smoke.spec.ts`.
- **Le trou du voile épouse la forme de la cible.** Le `clip-path: polygon()` ne faisait que des
  rectangles à angles droits → des coins de page non assombrie dépassaient du contour vert arrondi.
  Remplacé par un `box-shadow` de spread démesuré sur une boîte positionnée : **le trou EST la boîte**,
  et une ombre suit le `border-radius`. Le rayon est lu sur la cible (`getComputedStyle`) + la marge,
  donc chaque étape est concentrique quelle que soit la cible (nav `rounded-xl`, CTA `rounded-lg`).
  Bordure en `outline` et non `ring` (le `ring` de Tailwind est lui-même un box-shadow → collision).
  `cutoutPolygon` et ses tests supprimés, devenus du code mort.
  - **Piège corrigé au passage** : piloter la visibilité du voile en DOM était un bug — `selector` vaut
    déjà `null` avant la résolution des étapes, donc l'effet ne se rejouait jamais pour l'étape
    d'accueil et son voile restait sur sa classe `hidden`. La visibilité est redevenue **déclarative** ;
    seule la géométrie est écrite en DOM.
