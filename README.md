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

## Migrations Prisma — rappel (et équivalents Rails)

**Le sens est inversé par rapport à Rails.** En Rails tu écris la migration, tu la joues,
et `schema.rb` est *déduit* de la base. Ici c'est `prisma/schema.prisma` qui est la
**source de vérité** : tu modifies le schéma, et Prisma **génère** le SQL qui amène la base
d'où elle est à ce que tu décris.

Le cycle courant :

```bash
# 1. tu édites prisma/schema.prisma (ajout d'un champ, d'un modèle…)
npx prisma migrate dev --name add_user_is_admin   # génère le SQL, l'applique, régénère le client
```

| Rails | Prisma | Note |
|---|---|---|
| `rails g migration` + `rails db:migrate` | `prisma migrate dev --name <nom>` | Prisma écrit le SQL pour toi (diff schéma ↔ base) |
| `rails db:migrate` (prod) | `prisma migrate deploy` | n'invente rien : applique les migrations en attente |
| `rails db:migrate:status` | `prisma migrate status` | où en est la base |
| `schema_migrations` | `_prisma_migrations` | la table de suivi, même idée |
| `db/migrate/*.rb` | `prisma/migrations/*/migration.sql` | du SQL brut, versionné, relisible en review |
| `schema.rb` (artefact) | `schema.prisma` (**source**) | c'est là toute la différence |
| — | `prisma generate` | régénère le client **typé** ; pas d'équivalent Rails (ActiveRecord introspecte à chaud) |

Trois points qui surprennent quand on vient de Rails :

1. **Pas de `rails db:rollback`.** Prisma n'a pas de `down`. On corrige **en avant** :
   nouvelle migration qui annule. (`migrate reset` existe mais **efface la base** — dev jetable
   uniquement, donc pas ici.)
2. **`prisma generate` n'est pas optionnel.** Le client TypeScript est un fichier généré
   (`lib/generated/prisma`) : sans lui, ton nouveau champ n'existe pas pour le compilateur.
   `migrate dev` le fait automatiquement ; le `build` aussi.
3. **Une seule base pour dev et prod** (cf. `PROD_CHECKLIST.md`) : un `migrate dev` en local
   **touche la prod**. D'où la règle du projet — une PR **commite** sa migration, elle ne
   l'applique jamais ; c'est Maxime qui la joue à la main, avant le merge.

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
