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
