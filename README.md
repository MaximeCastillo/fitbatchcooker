# FitBatchCooker

SaaS perso de meal-prep protéiné avec un bot « chef » qui apprend les préférences
alimentaires de l'utilisateur. Spec produit : [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) ·
Journal des décisions : [`DECISIONS.md`](./DECISIONS.md) · Journal d'apprentissage :
[`LEARNING_LOG.md`](./LEARNING_LOG.md).

En ligne : **https://fitbatchcooker.vercel.app**

## Stack

Next.js 16 (App Router) · TypeScript (strict) · Tailwind v4 + shadcn/ui · Supabase
(Postgres) · Prisma 7 · déploiement Vercel.

## Prérequis

- **Node 24** — la version est épinglée dans `.nvmrc`. Avec nvm : `nvm use` (lit `.nvmrc`).
- Un projet **Supabase** (fournit la base Postgres).

## Installation

```bash
nvm use                 # Node 24 (depuis .nvmrc)
npm install
cp .env.example .env    # puis remplis les deux URLs (voir ci-dessous)
npx prisma migrate dev  # applique les migrations sur ta base
npx tsx prisma/seed.ts  # (optionnel) recettes de départ
npm run dev             # http://localhost:3000
```

## Variables d'environnement (`.env`, jamais commité)

Depuis Supabase → projet → **Connect** :

| Variable | Connexion | Port | Usage |
|---|---|---|---|
| `DATABASE_URL` | Transaction pooler (`?pgbouncer=true`) | 6543 | runtime de l'app (driver adapter) |
| `DIRECT_URL` | Session / directe | 5432 | migrations Prisma (CLI) |

Prisma 7 n'a plus de `directUrl` : l'URL du runtime passe par le driver adapter
(`lib/prisma.ts`), l'URL des migrations est dans `prisma.config.ts` (`DIRECT_URL`).

## Commandes utiles

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de dev (hot reload) |
| `npm run build` | Build de prod (`prisma generate && next build`) |
| `npm start` | Sert le build de prod |
| `npm run lint` | ESLint |
| `npx prisma migrate dev --name <nom>` | Crée **et** applique une migration (dev) |
| `npx prisma migrate deploy` | Applique les migrations en attente (prod) |
| `npx prisma generate` | Régénère le client Prisma (`lib/generated/prisma`) |
| `npx prisma studio` | GUI pour explorer la base |
| `npx tsx prisma/seed.ts` | Seed des recettes de départ |

## Déploiement

Push sur `main` → Vercel déploie en prod automatiquement. Chaque branche/PR obtient
une **preview** avec son URL. Les migrations ne tournent **pas** dans le build (voir
la stratégie dans `DECISIONS.md`).

## Docs internes

- [`CLAUDE.md`](./CLAUDE.md) — constitution du projet + conventions
- [`PROJECT_SPEC.md`](./PROJECT_SPEC.md) — le produit et son archi
- [`DECISIONS.md`](./DECISIONS.md) — historique des décisions (le « pourquoi »)
- [`LEARNING_LOG.md`](./LEARNING_LOG.md) — journal d'apprentissage par session
- [`PROD_CHECKLIST.md`](./PROD_CHECKLIST.md) — dettes temporaires à rembourser avant la prod
