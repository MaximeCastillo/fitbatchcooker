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
