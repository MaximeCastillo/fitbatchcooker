# Spec Projet — FitBatchCooker (SaaS Meal Prep)

> Nom affiché centralisé dans une constante `APP_NAME` = **"FitBatchCooker"** (un
> seul point à changer pour un rebranding). Domaine : **`fitbatchcooker.com`** — nom
> d'app et domaine identiques (cohérence + clarté : fit + batch + cooker dit tout).
> Le nom technique (repo, Vercel, Supabase, package.json) est trivial à renommer.

> Document vivant. Décrit **ce qu'est le produit et comment il est construit
> aujourd'hui**. Quand le cœur change, mets à jour ce fichier. Pour l'historique du
> *pourquoi*, voir `DECISIONS.md`. Pour les conventions de code et la façon de
> travailler avec l'auteur, voir `CLAUDE.md`.

---

## 1. Vision

Une app perso de meal-prep (multi-utilisateurs, un compte par personne) pour une
cuisine saine et riche en protéines. La pièce maîtresse est un bot "chef"
conversationnel qui :

- propose des recettes à la demande (« donne-moi 2 recettes au poulet, 35g+ de
  protéines, des légumes, pour 2 »),
- **apprend les préférences alimentaires** de l'user et s'en sert pour personnaliser,
  proposer des variantes, et rééquilibrer un plat,
- persiste en base les recettes que l'user valide, dans son livre de recettes.

**Orientation produit — prise de masse & côté pratique.** L'app sert un objectif
concret pour l'auteur :
- avoir des **plats déjà prêts** (meal prep) : simples, bons, pas relou à préparer ;
- des plats **équilibrés** — le bot aide activement à ajouter des légumes (point
  faible assumé de l'user) ;
- **atteindre un objectif de protéines par jour**, **propre à chaque utilisateur** :
  formule 2 g/kg de masse corporelle → l'objectif est **calculé depuis le poids de
  l'user** (on stocke son poids ou sa cible). Exemple perso de l'auteur : **120 g/jour**
  (il en est loin aujourd'hui). Les protéines par portion sont donc une info **mise
  en avant**, et l'objectif quotidien (personnalisé) est l'étoile polaire du produit ;
- garder un **stock de bonnes idées** et proposer des **variantes faciles** pour
  rester motivé, aimer ce qu'on mange, et coupler ça à un programme de muscu.

**Le cœur du produit : la planification gamifiée, en amont (PAS un tracker quotidien).**
FitBatchCooker n'est pas une app de suivi jour après jour. C'est un outil de
**planification en amont** : l'utilisateur passe un moment (typiquement le dimanche) à
**composer plusieurs jours de repas** (2, 3, une semaine), en remplissant pour chaque
jour une **jauge de protéines** jusqu'à son **objectif personnel** (qu'il **fixe
lui-même** ; ~2 g/kg de masse corporelle conseillé). La sortie
concrète = un **quota de batch** : la liste des plats à cuisiner d'avance, en **nombre
de parts / nombre de jours**, chaque jour étant validé côté protéines (et idéalement
côté équilibre légumes). L'expérience est **ludique et satisfaisante** : chaque jour
passe au **« vert »** quand la jauge est atteinte, avec des suggestions de complément
(« un blanc de poulet (35 g) + un yaourt grec (10 g) et c'est plié »). Le plaisir est
dans la **composition de la période**, pas dans un suivi quotidien.

Bref : orientation **prise de masse**, pratique et motivante.

L'app est aussi un support d'apprentissage d'une stack JS/TS moderne (l'auteur vient
de Rails et découvre toute la stack).

---

## 2. Stack technique

| Couche         | Choix                          | Notes                                          |
|----------------|--------------------------------|------------------------------------------------|
| Framework      | Next.js (App Router)           | Server Components par défaut ; `"use client"` opt-in |
| Langage        | TypeScript                     | Mode strict                                    |
| Style / UI     | Tailwind CSS + shadcn/ui       | Composants primitifs shadcn                    |
| Base de données| Supabase (Postgres managé)     |                                                |
| Auth           | Supabase Auth                  | Email/password + OAuth plus tard si voulu      |
| ORM            | Prisma                         | Choisi vs Drizzle pour un ressenti proche de Rails |
| IA             | Clé API fournie par l'user (BYO)| Un seul fournisseur pour démarrer (voir §6)   |
| Hébergement    | Vercel (app) + Supabase (data) |                                                |

**Règles d'or dès le jour 1 :**
- Secrets, accès DB et appels IA **côté serveur uniquement** (Server Components,
  Server Actions, route handlers). Jamais dans un Client Component.
- KISS / YAGNI partout. On construit le MVP, on résiste au superflu.

---

## 3. Modèle de données (conceptuel)

Décrit conceptuellement ; le schéma Prisma exact est défini pendant le build.

- **User** — fourni par Supabase Auth. Les lignes app référencent l'id auth.
  Profil : **objectif protéines quotidien** saisi **directement** (`proteinTargetG`).
  On **conseille ~2 g/kg** de masse corporelle, mais l'user fixe sa cible (pas de
  formule imposée). Le **poids** (`weightKg`) reste **optionnel** (aide éventuelle),
  non requis — droppable plus tard s'il ne sert pas.
- **Recipe** — titre, description, étapes, portions (portion de référence), macros
  (protéines/calories… en **estimations**), tags/catégorie (poulet, pâtes, italien…).
  Les recettes seed ET les recettes IA validées vivent ici. Une `Recipe` peut être un
  **plat complet** ou un **aliment simple** (encas, élément de petit-déj — ex. yaourt
  grec) : seule la valeur protéines compte pour la jauge, les étapes sont optionnelles.
  **Pas de modèle `Meal` séparé au MVP** (KISS) ; un tag `mealType` viendra si besoin.
- **Ingredient** — nom, unité par défaut optionnelle.
- **RecipeIngredient** — table de jointure : recette ↔ ingrédient avec
  **quantité + unité** pour la portion de référence (on scale à l'affichage pour N
  portions).
- **UserRecipe** (le "livre de recettes") — lie un user à une recette sauvegardée,
  avec une **note (0–3 étoiles)** optionnelle et un flag favori.
- **Preference** — lignes flexibles et typées captées par le bot (voir §5). Forme :
  `{ userId, type, value, sentiment, note }`. `type` volontairement ouvert.
- **MealPlan** — une **période de planification** composée par l'user (2, 3 jours, une
  semaine). Appartient à un user.
- **PlanEntry** — un plat placé dans un plan, à un **jour donné** (`dayIndex`) avec un
  **nombre de parts**. Contribution protéines d'une entrée = `protéines/portion` de la
  recette × parts.
- *Dérivés (calculés, non stockés) :* la **jauge d'un jour** = somme des protéines des
  entrées de ce jour vs l'objectif quotidien de l'user ; le **quota de batch** = pour
  chaque recette, total des parts à cuisiner sur toute la période.

L'auteur vient de Rails/ActiveRecord — le pattern jointure + portion de référence
lui est familier, on le garde.

---

## 4. Fonctionnalités MVP

1. **Bibliothèque de recettes + livre perso**
   - Parcourir une bibliothèque partagée (seedée au lancement, voir plus bas).
   - Sauvegarder dans son livre, marquer favori, noter 0–3 étoiles.
   - Filtres (poulet, riz, pâtes, catégorie…) et vue favoris.
2. **Détail recette**
   - Étapes + ingrédients à acheter, avec **nombre de portions réglable**
     (les quantités se calculent depuis la portion de référence).
   - **Protéines par portion mises en avant** (info clé vu l'objectif prise de masse).
   - *Piste proche (pas forcément jour 1, à ne pas sur-construire) :* un repère
     d'objectif quotidien de protéines **personnalisé** (calculé depuis le poids de
     l'user, 2 g/kg) — commencer par afficher les protéines, l'agrégation "somme du
     jour" peut venir juste après. Garder simple.
3. **Bot chef (chat)**
   - Conversation naturelle pour demander des recettes.
   - Propose des recettes ; **sur "ok" explicite**, les persiste au livre.
   - Capte les préférences en arrière-plan pendant la conversation (voir §5).
4. **Planification gamifiée (le cœur du produit)**
   - Composer une **période** de N jours (2, 3, une semaine) à partir des recettes
     (livre perso + bibliothèque).
   - Pour chaque jour, une **jauge de protéines** qui se remplit jusqu'à l'objectif
     **fixé par l'user** (~2 g/kg conseillé) ; le jour passe au **« vert »** une fois
     atteint. Compléments via **encas / petit-déj** (ce sont aussi des `Recipe`).
     (Équilibre
     légumes : bonus visé, pas jour 1.)
   - **Suggestions de complément** pour boucler un jour (« +35 g avec un blanc de
     poulet… »).
   - Sortie concrète : un **quota de batch** — la liste des plats à préparer d'avance,
     en **parts / jours**.
   - **Ce n'est pas un tracker quotidien** : le plaisir est dans la composition en amont.
5. **Recettes de départ (seed)**
   - ~10 recettes saines orientées sport pour que la bibliothèque ne soit jamais
     vide au premier lancement. Seed et générées partagent la même table.
6. **"Ce que le chef sait de moi"**
   - Écran listant les préférences captées ; l'user peut éditer/supprimer.

---

## 5. Le bot chef & la mémoire des préférences

**Le modèle n'a pas de mémoire entre deux appels.** La "mémoire" = des données en
Postgres qu'on injecte dans chaque prompt. Mécanisme :

1. Préférences stockées **structurées** (table `Preference`) pour la rigueur et le
   requêtage.
2. Au moment du prompt, on **rend ces lignes en langage naturel** et on les injecte
   en contexte (« Voici ce que tu sais de l'utilisateur : aime le poulet, préfère
   les pommes de terre au four, veut peu d'ustensiles, a toujours de l'ail… »).
3. Le coût en tokens du profil est négligeable vs une génération — pas d'optim
   prématurée. (Leviers futurs si ça grossit : résumer le profil, injecter seulement
   le pertinent, prompt caching. YAGNI pour l'instant.)

**Deux flux distincts — ne pas confondre :**

- **Création de recette → confirmation explicite.** Une recette n'est écrite que sur
  "ok". Le livre ne se remplit pas tout seul.
- **Captage de préférence → ambiant + révisable.** Pas d'interrogatoire mécanique
  (« alors tu préfères vraiment le pesto rouge ? »). Le bot note en arrière-plan et
  l'user révise/corrige plus tard dans l'écran "Ce que le chef sait de moi".
  Éventuellement un signal discret en chat (« 📝 noté : adore les barbecues »).

**Comment marche le captage ambiant : le tool calling.**
On expose au modèle des fonctions qu'il peut appeler (ex. `save_preference(type,
value, sentiment)`, `create_recipe(...)`). Quand la conversation révèle une
préférence, le modèle renvoie une *demande d'appel de fonction* structurée au lieu
de texte ; notre code serveur exécute le vrai `INSERT` (avec validation). Le modèle
propose l'appel ; notre backend décide et exécute. Analogie Rails : comme si le
modèle pouvait appeler tes actions de controller — tu définis les actions dispo, tu
valides les entrées, tu gardes la main.

**Taxonomie de préférences large et ouverte** (un chef/coach/ami retient de tout).
`type` est libre. Familles attendues :
- goûts (aime le poulet, adore la cuisine méditerranéenne, glace préférée…)
- aversions / à éviter (n'aime pas l'aubergine…)
- contraintes de cuisine (peu d'ustensiles, pas de cuisine longue quand fatigué…)
- garde-manger (a toujours de l'ail, du cumin…)
- contexte/occasions (adore les barbecues l'été, cuisine pour 2 le plus souvent…)
- objectifs (beaucoup de protéines, healthy…)

**Exception sécurité — contraintes dures.** Allergies et intolérances : rigueur en
plus. **Confirmées explicitement** (jamais déduites en douce) et **toujours
respectées** dans chaque génération. C'est de la sécurité, pas de la friction. Tout
le reste est capté léger.

---

## 6. Fournisseur IA — Bring Your Own Key (BYO)

Choix : **l'user fournit sa propre clé API** (l'app ne paie pas l'inférence). Note :
un abonnement grand public (ChatGPT Plus, Claude Pro) ne donne *pas* d'accès
programmatique — il faut une **clé API développeur**, facturée à l'usage. Ça convient
à un contexte perso / power-user, ce qui est l'intention ici.

**Gestion des clés (sujet d'apprentissage important) :**
- Stocker les clés **chiffrées au repos**. Jamais en clair.
- Jamais exposer la clé au navigateur. Déchiffrer et utiliser **côté serveur
  uniquement**.
- Démarrer avec **un seul fournisseur**. Pas d'abstraction multi-fournisseurs
  maintenant (SDK différents = complexité). Plus tard si besoin réel. YAGNI.

---

## 7. Auth & multi-utilisateurs

- Multi-utilisateurs dès le jour 1 via **Supabase Auth**.
- **Approche d'autorisation (décision documentée) :** Prisma se connecte avec une
  connexion privilégiée/poolée qui **contourne le Row Level Security** de Postgres.
  Donc l'autorisation *principale* est le **scoping des requêtes côté serveur** —
  chaque requête est scopée à l'user connecté (très proche des scopes Rails /
  `where(user_id:)`). Le RLS est traité comme **défense en profondeur optionnelle**
  à explorer plus tard, pas comme le mécanisme du jour 1. Friction basse, sécurité
  ok. (Voir `DECISIONS.md`.)

---

## 7bis. Stratégie mobile (anticipation légère)

Ordre de coût croissant :
- **Responsive (gratuit, maintenant) :** codé mobile-first avec Tailwind → l'app est
  utilisable sur téléphone dès le départ. Couvre l'essentiel du besoin.
- **PWA (faible coût, plus tard) :** app installable sur l'écran d'accueil, reste du
  web. Bon compromis si on veut le confort sans natif.
- **Natif (gros chantier, seulement si ça décolle) :** UI à réécrire en React
  Native/Expo. On ne "convertit" pas un site Next en natif. **Mais** le backend
  (Supabase, logique serveur) est réutilisable tel quel.

**Impact maintenant :** aucune préparation spécifique, sauf **une bonne habitude** —
séparer la logique métier / accès données de l'UI, pour qu'un futur natif puisse
taper le même backend. C'est de toute façon une bonne pratique. YAGNI pour le reste.

## 7ter. Stratégie multilingue (anticipation légère)

Deux types de texte, deux coûts très différents :
- **Contenu généré par l'IA (recettes, réponses du bot) → gratuit.** Le modèle est
  polyglotte : on lui demande de répondre dans la langue de l'user. Chaque user
  génère dans sa langue, pas besoin de stocker une recette en N langues.
- **Textes d'interface (boutons, labels…) → vrai système i18n.** Next le gère bien
  (routing par langue + lib type `next-intl`).

**Impact maintenant :** une seule habitude, cheap → **ne jamais coder les textes
d'UI en dur** éparpillés dans les composants ; les centraliser (clés de traduction
ou a minima un fichier de textes). Rétro-fitter l'i18n plus tard = chasse aux strings
en dur dans tout le code = enfer. Fait dès le départ, c'est indolore.

**Pas maintenant (YAGNI) :** installer la machinerie i18n complète ou traduire quoi
que ce soit. On code en une langue, textes bien rangés, on branche la lib quand une
2ᵉ langue devient un vrai besoin.

## 8. Explicitement hors scope (pour l'instant)

Écartés volontairement pour protéger le MVP (YAGNI) :
- Génération de liste de courses (façon Jow) — prévue plus tard.
- Support IA multi-fournisseurs — un seul pour commencer.
- Workflows de code agentique — sujet d'apprentissage ultérieur.
- Macros vérifiées par une base nutritionnelle — au MVP les macros sont des
  **estimations** ; à durcir plus tard si la précision protéines devient critique.

---

## 9. Questions ouvertes / décisions à prendre pendant le build

- Valeurs exactes de `Preference.type` (démarrer libre, guetter un enum naturel).
- Représentation/affichage des macros vu qu'elles sont estimées (les libeller comme
  approximatives dans l'UI).
- Détails de connexion Prisma + Supabase sur Vercel/serverless : connexion poolée
  (pgBouncer) pour l'app vs connexion directe pour les migrations — à traiter au
  câblage de la base. (À flaguer pour Claude Code à ce moment-là.)
- Génération libre (le modèle invente) — choix actuel — vs base existante. Choix
  actuel : **générer + stocker les validées**, bibliothèque seedée au lancement.
