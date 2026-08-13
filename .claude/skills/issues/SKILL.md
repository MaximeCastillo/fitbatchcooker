---
name: issues
description: Transformer des retours bruts (démo, idées, bugs) en issues GitHub prêtes pour un agent autonome, puis réaliser les issues `ready` — une branche par issue, une PR courte avec screenshots. À invoquer soit pour forger des issues depuis des retours, soit pour traiter la file d'issues.
---

# Issues — forger & réaliser

Deux modes selon ce que demande Maxime : **forger** (retours → issues) ou
**réaliser** (issues `ready` → PRs). Les conventions de `CLAUDE.md` s'appliquent
toujours (i18n en parité, scoping user, commits gitmoji, coach).

## Mode 1 — Forger des issues depuis des retours bruts

1. **Collecte** : Maxime colle ses retours/idées en vrac. Ne rien créer encore.
2. **Exploration** : localiser dans le code ce que chaque retour touche
   (fichiers, composants, patterns existants à imiter).
3. **Découpage — la règle clé** : regrouper un **maximum de petits retours dans
   une seule issue** (une « fournée » cohérente). Ne découper que si :
   - domaines vraiment différents (ex. UI recettes vs logique du bot) ;
   - une partie dépend d'une autre (alors 2 issues liées « dépend de #N ») ;
   - la fournée dépasse ce qu'une PR reviewable en ~10 min peut porter.
4. **Arbitrage AVANT création** : poser à Maxime les questions ambiguës
   (comportement attendu, priorité, « on garde ou on jette »). Une issue créée
   doit être réalisable **sans lui**.
5. **Création** via `gh issue create`, label `ready`, body sur ce template :

```markdown
## Pourquoi
1-3 phrases : le problème, d'où vient le retour.

## Quoi (critères d'acceptation)
- [ ] Quand ..., alors ...

## Où (rempli grâce à l'exploration)
Fichiers concernés, pattern existant à suivre.

## Vérification
Comment prouver que ça marche (build + test réel sur le dev server + spécifique).
```

- Si l'issue implique une **migration Prisma** : l'écrire en tête du body
  (`⚠️ Migration de schéma — voir Mode 2`).
- Issue entièrement en **français** (titre court à l'impératif + body). Seuls les
  commits et le code restent en anglais.

## Mode 2 — Réaliser les issues `ready`

Pour chaque issue, dans l'ordre de la file (`gh issue list --label ready`) :

1. **Verrou** : ajouter le label `in-progress`, retirer `ready`.
2. **Branche** depuis un `main` à jour : `issue/<n>-<slug>`. Ne jamais commiter
   sur `main` dans ce mode.
3. **Implémenter** en suivant le body de l'issue — le « Hors scope » implicite :
   ne rien faire qui n'est pas dans les critères d'acceptation.
4. **Vérifier pour de vrai** : lint + tests + build, puis le scénario de la
   section Vérification sur le dev server.
5. **Screenshots** : capturer le résultat (états avant/après si pertinent),
   les commiter sous `.github/pr-assets/issue-<n>/` sur la branche.
6. **PR** : description **très courte** — 2-4 lignes (quoi + comment vérifier),
   les critères d'acceptation en cases à cocher (la recette de Maxime), les
   screenshots embarqués, et `Closes #<n>`. Sur l'issue : retirer `in-progress`,
   poser `to-review`.
7. **Migration Prisma dans la branche ?** Ne jamais l'appliquer sur la DB
   (partagée avec la prod). La commiter seulement, et l'annoncer en tête de PR :
   `⚠️ Contient une migration — appliquer manuellement avant merge`.
8. Si `main` a bougé entre-temps : rebase avant d'ouvrir la PR, résoudre les
   conflits (typiquement `messages/*.json`).
9. **Merge** : jamais sans validation explicite de Maxime (sa recette = tous les
   critères cochés). Quand il valide : `gh pr merge --squash --delete-branch`
   (squash — `main` lit « 1 commit = 1 issue » ; le détail vit dans la PR).
   Le `Closes #<n>` ferme l'issue automatiquement. Puis `git pull` sur `main`.

Issues indépendantes (aucun fichier partagé, déclaré au cadrage) : paralléliser —
un agent par issue, chacun dans son **worktree** isolé (voir la mémoire
worktree : `.env` à copier, `prisma generate`, port dev dédié).

Fin de file : petit récap des PRs ouvertes, et signaler ce qui a bloqué le cas
échéant (issue ambiguë → commentaire sur l'issue + label `ready` retiré).
