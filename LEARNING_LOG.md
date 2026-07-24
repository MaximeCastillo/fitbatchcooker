# Journal d'apprentissage — FitBatchCooker

Bilan **daté, par session**, de la progression de l'auteur (Maxime, venu de Rails).
But : garder trace de ce qu'on a construit, des concepts appris et des victoires — pour
situer où on en est et entretenir la motivation. Append-only ; on n'efface pas le passé.

Complémentaire des autres docs : `PROJECT_SPEC.md` = le produit, `DECISIONS.md` = le
*pourquoi* des choix techniques, ce fichier = la *progression humaine*.

---

## Session 1 — 2026-07-17 — Fondations + première mise en ligne

**Objectif :** poser les fondations. Résultat : dépassé — l'app est **en ligne**.

### Ce qu'on a construit
- Projet **Next.js 16** (App Router) + **TypeScript strict** + **Tailwind v4** + **shadcn/ui**.
- `APP_NAME` centralisé ; textes d'UI centralisés dans `lib/strings.ts` (i18n-ready).
- **Supabase + Prisma 7** câblés, avec le split connexion **poolée (runtime)** /
  **directe (migrations)**.
- Schéma `User` (avec `weightKg` pour l'objectif protéines) + `Recipe`, migré.
- Page `/recipes` **dynamique** qui liste les recettes depuis la base (+ 4 recettes seed).
- **Repo GitHub** + **déploiement Vercel** auto (push `main` → prod, branches → previews).
- Outillage : boucle de vérif (types + logs + curl) et plugin **Context7** (doc à jour).

### Concepts appris (🆕)
- **Server Components** : un composant qui s'exécute côté serveur, `await` la base
  directement, renvoie du HTML — un « controller + vue » Rails fusionnés.
- **Client Components** (`"use client"`) : pour l'interactivité, envoyés au navigateur.
- **Routing par dossiers** (App Router) : `app/recipes/page.tsx` → `/recipes`.
- **Prisma** : `schema.prisma`, `migrate dev` vs `migrate deploy`, `generate`, le client typé.
- **Prisma 7** : plus de moteur Rust → **driver adapter** (`@prisma/adapter-pg`) ; plus de
  `directUrl`.
- **Pooled vs direct** en serverless : pourquoi deux connexions (6543 runtime / 5432 migrations).
- **Statique vs dynamique** dans Next : `force-dynamic` pour des données qui changent.
- **shadcn** : du code qu'on possède (pas une lib figée) ; composition **Base UI** via
  `render` (≠ `asChild` de Radix).
- **Vercel** : Preview Deployments par branche, variables d'env chiffrées, version de Node
  via `engines.node`.
- **Stratégie de migration** : le déploiement du code et la migration de la base sont deux
  étapes distinctes (comme en Rails).

### Pièges rencontrés & résolus
- **Node 16** trop vieux → passage à Node 24 (`.nvmrc`). Même cause pour Context7 qui ne
  se connectait pas (MCP lancé en Node 16).
- **Prisma 7** différent des tutos (`directUrl` supprimé) → vérifié via la doc, pas deviné.
- **`asChild`** (réflexe Radix) invalide sur un Button **Base UI** → `render` + le LSP a
  confirmé.
- **Warning a11y `nativeButton`** (erreur runtime, pas de type) → d'où la boucle de vérif
  qui lit aussi les logs, pas seulement les types.

### Victoire
🎉 De zéro à une app **en production** en une session, sur une stack 100 % neuve pour
l'auteur — et le déploiement a marché **du premier coup**.

### Prochaine session
1. **Supabase Auth** (comptes + scoping serveur).
2. Puis le **bot chef** + **tool calling** (l'intégration IA, objectif central).

---

## Session 2 — 2026-07-20 — Auth, livre de recettes, le chef (tool calling), profil

**Objectif :** auth + première intégration IA. Résultat : le bot **agit et se souvient**.

### Ce qu'on a construit
- **Auth Supabase complète** : signup/login/logout (Server Actions), middleware de
  rafraîchissement de session, pont `auth.users` ↔ `User` (upsert paresseux, auto-réparateur).
- **Livre de recettes perso** : modèle `UserRecipe`, sauvegarde/retrait **scopés**, page
  « Mes recettes », composant **`RecipeCard`** partagé (DRY, prêt pour le design).
- **Le chef** : chat **streaming** (Vercel AI SDK v7 + OpenAI), accueil **statique,
  personnalisé et varié** (sans tokens).
- **Tool calling `save_preference`** : **capture** (Zod + INSERT scopé) **et recall**
  (réinjection dans le prompt), **cadré au domaine** alimentaire, **testé avec Vitest**.
- **Profil** : prénom + objectif protéines (saisi directement) ; prénom injecté dans le chef.
- **Revue sécurité** du bot + plan (`PROD_CHECKLIST`) ; **recentrage produit** (planification
  gamifiée) dans la spec.

### Concepts appris (🆕)
- **Server Actions** : formulaire → fonction serveur, sans route API.
- **Supabase Auth** : `auth.users` (schéma auth) vs notre `User` (public) ; clé **anon
  publique** vs **service_role secrète** ; `NEXT_PUBLIC_` = exposé au navigateur.
- **Middleware Next** : refresh de session + en-têtes anti-cache obligatoires.
- **Tool calling** : la boucle (le modèle propose → on valide/exécute → résultat → il
  continue) ; **règle d'or** : `userId` de la session, jamais du modèle.
- **La « mémoire » d'un LLM** = données en base **réinjectées à chaque prompt**
  (capture ≠ mémoire → il faut le **recall**). Le modèle est **aveugle à la base**.
- **Économie de tokens** : pas d'appel pour un simple accueil (statique).
- **Scoping serveur = autorisation** (`where: { userId }`).
- **Vitest** : on teste la **logique métier / la validation des sorties IA**, pas le framework.

### Pièges rencontrés & résolus
- shadcn **Base UI** : `asChild` (Radix) → `render` + `nativeButton=false` ; warning
  **runtime** attrapé via les **logs** (pas par les types).
- Le LSP ne voit que les fichiers ouverts → **`tsc --noEmit`** comme juge de paix
  (a attrapé `prisma.userRecipe` manquant et l'API v7 dépréciée).
- `migrate dev` ne régénère pas le client ici → `prisma generate` explicite (+ **restart**
  du dev pour charger le nouveau client).
- **AI SDK v7** plus récent que la doc Context7 → `tsc` a validé la compat et attrapé
  `toUIMessageStreamResponse` déprécié.
- **OpenAI « exceeded quota »** = pas de crédit (un check direct a évité un bug confus dans l'UI).
- Le bot enregistrait **hors domaine** (« voitures ») → cadrage par le prompt + la description d'outil.

### Victoires
🎉 Le bot **AGIT** (crée de la donnée) **et se souvient** (recall) — la brique IA #1 de la
spec, palpable. Et il t'appelle par ton **prénom** avec des accueils variés → il devient attachant.

### Prochaine session
1. **La planification gamifiée** (le cœur produit) — l'Étape 0 est déjà prête via le Profil
   (objectif protéines) : modèles `MealPlan`/`PlanEntry`, composition + jauge protéines + quota de batch.
2. Puis : suggestions de complément, écran « Ce que le chef sait de moi », durcissement prod.

---

## Session 3 — 2026-07-23 — Perf, refonte UI/UX, et le cœur produit "batch"

**Grosse session.** Perf, identité visuelle complète, puis on a bâti le composeur de batchs.

### Ce qu'on a construit
- **Perf** : région Vercel → **Francfort (`fra1`)** collée à la base ; `getCurrentUser`
  dédupliqué (`cache()` React) + lecture-avant-écriture ; **optimistic UI** + **skeletons**
  (`loading.tsx`). Mesuré : **~4,5× plus rapide** en prod (avant/après chiffré).
- **Refonte UI/UX** (skills `ui-ux-pro-max` + `taste-skill`, aperçus **Artifact**) :
  identité **vert + orange**, typo **Barlow**, **shell à sidebar**, motif signature
  **« le contenant qui se remplit »**. Login 2 colonnes, **home nouveau user**, auth
  **un mode à la fois** (connexion/inscription + bascule).
- **Cœur produit "batch"** : modèles `Batch`/`BatchEntry`, **logique pure testée** (Vitest :
  jauge, quota), **Server Actions scopées**, page **« Mes batchs »** (multi-plans) et le
  **composeur** (jauges par jour, ajout/retrait, add/remove day, quota « À cuisiner »).
- **Outillage & doc** : whitelist de commandes + `PATH` Node 24 pinné (fini les prompts),
  **`ROADMAP.md`** vivant, recentrage produit dans la spec (planif gamifiée en amont).

### Concepts appris (🆕)
- **Server Component = controller + vue fusionnés** ; **Server Action** = action write ;
  **Client Component** = JS navigateur. Ce trio remplace le MVC de Rails.
- **`revalidatePath`** = « cette donnée a changé, ré-affiche » (cache Next).
- **`force-dynamic`** vs statique ; **colocalisation région app↔base** (perf serverless).
- **`cache()` React** (dédup par requête) ; **optimistic UI** (`useOptimistic`).
- **Design tokens** (shadcn) : changer l'identité = éditer des variables ; `@dnd-kit` (à venir).
- **Rename de modèle Prisma** : déclaratif → il ne devine pas un rename (voit DROP+CREATE =
  perte de données). Solution : **migration `RENAME` écrite à la main** + rename des
  contraintes/index. Pont Rails : `rename_table`/`rename_column` (impératif) préservent les
  données ; Prisma (déclaratif) impose de descendre au SQL.
- **Tests** : Vitest sur la **logique métier pure** (pas le framework).

### Pièges rencontrés & résolus
- Lenteur prod = **région US vs base Francfort** + appels/écritures répétés.
- Prisma **refuse** un rename non-interactif (DROP de tables non vides) → migration manuelle
  appliquée via `migrate deploy`.
- i18n : textes d'UI qui traînaient en dur → tout dans `lib/strings.ts` (code toujours en
  anglais, contenu multilingue).

### Victoires
🎉 L'app **ressemble à un vrai SaaS** (« abouti, pro, du premier coup »), et le **cœur
produit** (composer un batch, jauges qui passent au vert, quota à cuisiner) est **debout,
testé et déployable**. Premier **rename de base maîtrisé** sans rien perdre.

### Prochaine session
1. **Phase 5 : le drag & drop** (`@dnd-kit`) sur le composeur : palette→jour, jour→jour,
   Maj = dupliquer, palette = zone « ranger », + optimistic.
2. Puis : **« Ajouter à mon batch »** depuis les cartes recettes, polish **mobile tap-first**.
3. Plus tard : couche **ingrédients / protéines vérifiées**, suggestions de complément.

---

## Session 4 — 2026-07-24 — Recettes riches (Phase A), aperçu, et le composeur mobile-first

**Objectif :** rendre les recettes « riches » (Phase A) et polir le composeur de batch,
d'abord pour le mobile. Résultat : Phase A livrée + gros polish UX du composeur.

### Ce qu'on a construit
- **Polish UX batch** (début de session) : jauge plus vivante, undo à 10 s, **DragOverlay**
  (la recette reste en place dans la palette quand on la glisse), nommage unifié « recette ».
- **Docs fondatrices** : skill **`/session`** (runbook), **`PRINCIPLES.md`** (régularité >
  précision, modèle protéines/part) et **`DESIGN.md`** (direction artistique) ; **mobile-first**
  élevé au rang de principe.
- **Phase A — page détail recette** (`/recipes/[id]`) : étapes de cuisine, macros,
  note « valeurs approximatives » ; **cartes cliquables** (stretched-link).
- **Icône marque-page** (save) en coin de carte, un seul `SaveToggle` optimistic partout.
- **Modale d'aperçu** dans le composeur (voir une recette sans quitter la page), avec un
  composant **`RecipeDetail` partagé** (page + modale) et une **anim qui jaillit depuis la
  carte** cliquée.
- **`RecipeChip` unifié** (palette + jours, même design), et **polish mobile v1** :
  **tap-to-add** (bouton « + » → « ajouter à quel jour ? »), actions visibles au doigt,
  drag tactile = appui-maintenu (le swipe scrolle).
- **Page « Mon compte »** (email connecté visible, changer email/mot de passe) — déléguée
  à un agent, à relire avant push.

### Concepts appris (🆕)
- **`params` est une Promise** en Next 16 (`const { id } = await params`) — Next peut streamer.
- **Stretched-link** : `::after { inset: 0 }` sur un seul vrai `<a>` → toute la carte cliquable
  sans imbriquer d'ancre autour d'un bouton.
- **Radix Dialog + Portal** : modale rendue au niveau du `<body>` (échappe aux `overflow`/
  `z-index`), focus-trap/Échap/scroll-lock/exit-anim **gratuits**.
- **Centrage en flex plutôt qu'en `transform`** : garder le `transform` d'un élément **libre**
  pour l'animer (deux `transform` se marchent dessus). Anim d'origine via variables CSS
  `--dx/--dy` (translate depuis le point cliqué), coupée en `prefers-reduced-motion`.
- **React Compiler** (activé ici) : une closure doit référencer une valeur mémoïsée
  **déjà déclarée** au-dessus → ordonner les fonctions après leurs `useMemo`.
- **Sensors `@dnd-kit`** : `MouseSensor` + `TouchSensor` (délai) au lieu de `PointerSensor`,
  pour que le **scroll tactile** ne soit pas capté comme un drag.
- **Hiérarchie de surfaces / élévation** : sur un fond teinté, les panneaux blancs
  « flottent » ; on ne peut pas être plus clair que blanc → l'élévation d'une carte sur un
  panneau blanc se fait par **l'ombre**, pas par un fond plus clair.
- **Autorisation scopée user** : bug prod « mes données ont disparu » = simplement **connecté
  sur un autre compte** ; chaque requête est `where: { userId }` (comme `current_user.x` en
  Rails). D'où la page « Mon compte » avec l'email connecté bien visible.

### Victoires
🎉 Les recettes ont enfin une **page détail**, le composeur devient **utilisable au doigt**
(tap-to-add), et l'aperçu qui **jaillit de la carte** donne un vrai sentiment « produit fini ».

### Prochaine session
1. Relire + valider la **page « Mon compte »** (agent), puis push.
2. **Phase B — encas** (`Recipe.kind` MAIN/SNACK + onglets palette + seed).
3. Test **mobile réel** du composeur, itérer le tap-first si besoin.
