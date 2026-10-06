# FitBatchCooker

**Planifie tes repas protéinés de la semaine en quelques minutes, avec un chef IA qui connaît tes goûts.**

👉 **En ligne : https://fitbatchcooker.vercel.app**

Le dimanche, tu composes tes repas des prochains jours. Chaque jour a une jauge de protéines qui passe au vert quand ton objectif est atteint. L'app en sort la liste des plats à cuisiner d'avance, en nombre de parts. Un chef conversationnel propose des recettes, retient tes préférences et enregistre lui-même les recettes que tu valides.

> Principe fondateur : **la régularité, pas la précision.** En prise de masse, le résultat vient de la constance sur des mois, pas d'un chiffre exact un jour donné. L'app simplifie, elle ne calcule pas. Voir [`PRINCIPLES.md`](./PRINCIPLES.md).

## Pourquoi ce projet

Je suis Tech Lead Rails / React. J'ai construit FitBatchCooker pour deux raisons :

1. **Apprendre une stack que je n'avais jamais touchée** (Next.js, TypeScript, Supabase, Prisma, le tool calling des LLM), en livrant un vrai produit plutôt qu'un tutoriel.
2. **Changer ma façon de développer** : travailler entièrement avec un agent IA (Claude Code), où je conçois, décide, relis et recette, et où l'agent écrit l'essentiel du code.

Le projet a duré 5 semaines et demie (17/07 → 24/08/2026). Il compte environ 250 commits, et l'app est en production depuis le premier jour.

## Ce qu'il y a à voir

| Quoi | Où |
|---|---|
| **Les décisions et leur « pourquoi »** : environ 45 décisions d'architecture datées (choix de stack, sécurité du bot, recentrage produit, abandons assumés) | [`DECISIONS.md`](./DECISIONS.md) |
| **Le journal d'apprentissage** : 11 sessions, chacune avec ce qu'on a construit, les concepts appris, les pièges résolus et la victoire du jour | [`LEARNING_LOG.md`](./LEARNING_LOG.md) |
| **La constitution donnée à l'agent IA** : conventions, posture pédagogique, règles de travail | [`CLAUDE.md`](./CLAUDE.md) |
| **Le produit** : vision, architecture, modèle de données | [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) |
| **La direction artistique** | [`DESIGN.md`](./DESIGN.md) |

## Le chef IA

- **Tool calling** (Vercel AI SDK) : le chef cherche des ingrédients, crée des recettes et retient des préférences grâce à trois outils. La boucle agentique est bornée.
- **Garde-fous** :
  - les sorties du modèle sont validées par des schémas Zod ;
  - le chef ne peut pas inventer d'ingrédient (catalogue verrouillé de 420 entrées) ;
  - l'identité de l'utilisateur vient toujours de la session, jamais du modèle.
- **Mémoire** : les préférences sont stockées en base et réinjectées dans le contexte.

## Une méthode de développement agentique

Dans la seconde moitié du projet, j'ai mis en place un workflow « dev autonome » :

- **L'issue GitHub est le contrat.** Elle donne le pourquoi, le quoi, l'endroit à modifier et la recette de vérification.
- **Un agent prend une issue**, ouvre une branche et livre une PR courte avec une recette numérotée à cocher.
- **Plusieurs agents cloud travaillent en parallèle.** Trois sessions lancées depuis mon téléphone ont livré trois PR conformes en une quinzaine de minutes.
- **La CI est l'arbitre neutre** (lint, tests unitaires, build, e2e). **La recette reste humaine.**

Ce workflow est devenu un plugin Claude Code réutilisable, `/issues`. La méthode « apprendre en construisant » a ensuite été réappliquée à une app mobile, [Compotium](https://github.com/MaximeCastillo/compotium).

## Stack

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 + shadcn/ui · Supabase (Postgres + Auth) · Prisma 7 · Vercel AI SDK · Zod · next-intl (FR/EN) · Vitest · Playwright · GitHub Actions · Vercel.

**Qualité** : 73 tests unitaires, 22 tests end-to-end, et une CI complète sur chaque PR.

## Où en est le produit

- **En test réel** : je l'utilise moi-même, avec une poignée de testeurs de mon entourage, développeurs ou non, dont les retours nourrissent le produit.
- **Pensé pour la production dès le départ**, et pas comme un exercice : multi-comptes, authentification complète, i18n, tests et CI.
- **Prochaine étape, la monétisation** : choix d'un *merchant of record*, abonnements Stripe, et quotas d'usage du chef IA par abonnement (une seule clé API côté serveur, avec des limites par utilisateur).

---

## Lancer le projet en local


### Prérequis

- **Node 24** — la version est épinglée dans `.nvmrc`. Avec nvm : `nvm use` (lit `.nvmrc`).
- Un projet **Supabase** (fournit la base Postgres).

### Installation

```bash
nvm use                 # Node 24 (depuis .nvmrc)
npm install
cp .env.example .env    # puis remplis les deux URLs (voir ci-dessous)
npx prisma migrate dev  # applique les migrations sur ta base
npx tsx prisma/seed.ts  # (optionnel) recettes de départ
npm run dev             # http://localhost:3000
```

### Variables d'environnement (`.env`, jamais commité)

Depuis Supabase → projet → **Connect** :

| Variable | Connexion | Port | Usage |
|---|---|---|---|
| `DATABASE_URL` | Transaction pooler (`?pgbouncer=true`) | 6543 | runtime de l'app (driver adapter) |
| `DIRECT_URL` | Session / directe | 5432 | migrations Prisma (CLI) |

Prisma 7 n'a plus de `directUrl` : l'URL du runtime passe par le driver adapter
(`lib/prisma.ts`), l'URL des migrations est dans `prisma.config.ts` (`DIRECT_URL`).

### Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (hot reload) |
| `npm run build` | Build de prod (`prisma generate && next build`) |
| `npm start` | Sert le build de prod |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (Vitest) |
| `npm run e2e` | Tests end-to-end (Playwright) — démarre le dev server au besoin, purge les comptes de test en fin de suite (base **et** Supabase Auth) |
| `npx prisma migrate dev --name <nom>` | Crée **et** applique une migration (dev) |
| `npx prisma migrate deploy` | Applique les migrations en attente (prod) |
| `npx prisma generate` | Régénère le client Prisma (`lib/generated/prisma`) |
| `npx prisma studio` | GUI pour explorer la base |
| `npx tsx prisma/seed.ts` | Seed des recettes de départ |

### Déploiement

Push sur `main` → Vercel déploie en prod automatiquement. Chaque branche/PR obtient
une **preview** avec son URL. Les migrations ne tournent **pas** dans le build (voir
la stratégie dans `DECISIONS.md`).

### Docs internes

- [`CLAUDE.md`](./CLAUDE.md) — constitution du projet + conventions
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — le produit et son archi
- [`DECISIONS.md`](./DECISIONS.md) — historique des décisions (le « pourquoi »)
- [`LEARNING_LOG.md`](./LEARNING_LOG.md) — journal d'apprentissage par session
- [`PROD_CHECKLIST.md`](./PROD_CHECKLIST.md) — dettes temporaires à rembourser avant la prod
