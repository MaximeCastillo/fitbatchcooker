# Principes fondateurs & règles métier — FitBatchCooker

> Court et **stable**. Les **croyances qui contraignent chaque décision produit**.
> À relire en début de session (avec `PROJECT_SPEC.md`).
> Complément : `PROJECT_SPEC.md` = le *quoi/comment* aujourd'hui · `DECISIONS.md` =
> le *pourquoi* historique · `DESIGN.md` = la direction artistique.

---

## 1. Principe fondateur : la régularité, pas la précision

Le vrai résultat en prise de masse vient de la **régularité sur le long terme**
(plusieurs mois minimum), **pas** de la précision d'un jour donné.

Donc l'objectif de FitBatchCooker n'est **pas** de savoir exactement combien de
protéines tu manges un jour. C'est de t'aider à **rester proche de ta cible, semaine
après semaine, mois après mois**, sans effort ni prise de tête.

**Conséquence directe : l'approximation est un choix de design, pas un défaut.**
« À la louche » suffit. Mieux vaut un chiffre approximatif renseigné en 5 secondes
qu'un chiffre exact qui décourage.

## 2. L'app simplifie, elle ne calcule pas

FitBatchCooker **simplifie la vie**. Tout ce qui ressemble à de la config lourde, de
la pesée, ou du calcul nutritionnel précis est **banni**. Le combo gagnant :
**gamification + rapidité** pour motiver la régularité. Le plaisir de voir un jour
passer au **vert** bat n'importe quel tableau de macros.

## 3. Le modèle protéines : ingrédient → part (version simple)

Le concept dont **dépend tout le produit** — gardé volontairement grossier.

- Un **ingrédient** porte **deux infos, saisies à la louche** :
  1. **protéines / 100 g** (ex. blanc de poulet ≈ 21 g/100 g) ;
  2. **quantité habituelle** mise dans une recette (ex. un blanc ≈ 120 g).
- De ces deux nombres, l'app **déduit les protéines par part, grosso modo**
  (120 g × 21/100 ≈ 25 g). C'est **la part** qui compte : c'est l'unité que la jauge
  et le batch consomment.
- **Pré-remplissage par l'IA :** le chef propose ces deux nombres. **Objectif : ne
  jamais avoir à repasser derrière lui** → exigence de qualité forte sur le chef (des
  valeurs plausibles du premier coup).
- **Contrôle utilisateur :** on peut ouvrir un ingrédient (« blanc de poulet »)
  **quand on veut** pour ajuster à la volée soit les protéines/100 g, soit la quantité
  habituelle. Pas de vérité figée, pas de source « officielle » imposée.
- **Pourquoi l'imprécision est OK :** le vrai pourcentage varie selon la source, la
  marque, le magasin — personne ne le connaît exactement. Viser la précision ici
  serait une **fausse rigueur** qui alourdit sans servir l'objectif (la régularité).

## 4. ⚠️ Point de validation à prévoir (important)

Ce modèle ingrédient / protéines / part est le **socle du sens de l'app** : si les
quantités sont fausses, l'app perd tout intérêt. Avant de le construire en dur
(**Phase D**, voir `ROADMAP.md`), on fait **un point de validation dédié** ensemble
sur : l'ergonomie de saisie, la qualité du pré-remplissage IA, et le juste niveau
d'approximation. Simple — mais validé à deux.

## 5. Utilisable depuis le canapé (mobile-first)

FitBatchCooker se vit **d'abord sur téléphone** : avachi dans le canapé, tu sors ton
tél et tu composes tes 3 jours / ta semaine en t'amusant — **sans allumer le PC**.
C'est un objectif de base, pas une option.

Conséquences **non négociables** :
- **Mobile-first** : chaque écran est pensé et testé **sur petit écran d'abord**.
- **Tap-first** : toute action clé (ajouter / déplacer / retirer une recette) doit être
  faisable **au doigt, sans drag & drop**. Le drag est un *confort* (desktop, tap-and-
  hold), **jamais l'unique chemin** — le glisser au doigt est trop fragile pour en
  dépendre.
- **Cibles tactiles ≥ 44 px**, pas d'action réservée au survol (hover).

**Pas besoin d'app native pour ça.** Échelle sans cul-de-sac : responsive (déjà là) →
PWA (installable, coût faible) → natif *seulement si ça décolle* — et même là, le
backend Supabase reste réutilisable. Détail technique : `PROJECT_SPEC.md` §7bis.

## 6. Ce que le produit ne fait PAS (garde-fous)

- Pas de **tracker quotidien** — le plaisir est dans la planification en amont
  (cf. `PROJECT_SPEC.md` §1).
- Pas de **pesée** ni de **calcul nutritionnel précis** obligatoires.
- Pas de **config complexe** ni de **précision inutile**.
- Les macros affichées sont **assumées comme approximatives** (à libeller ainsi dans
  l'UI).
