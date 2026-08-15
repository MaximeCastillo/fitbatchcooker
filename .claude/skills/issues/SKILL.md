---
name: issues
description: Transformer des retours bruts (démo, idées, bugs) en issues GitHub prêtes pour un agent autonome, puis réaliser les issues `ready` — une branche par issue, une PR courte avec screenshots. À invoquer soit pour forger des issues depuis des retours, soit pour traiter la file d'issues.
---

# Issues — forger & réaliser

Deux modes selon ce que demande le mainteneur : **forger** (retours → issues) ou
**réaliser** (issues `ready` → PRs). Les conventions de `CLAUDE.md` s'appliquent
toujours (i18n en parité, scoping user, commits gitmoji, coach).

## Mode 1 — Forger des issues depuis des retours bruts

1. **Collecte** : le mainteneur colle ses retours/idées en vrac. Ne rien créer encore.
2. **Exploration** : localiser dans le code ce que chaque retour touche
   (fichiers, composants, patterns existants à imiter).
3. **Découpage — la règle clé** : regrouper un **maximum de petits retours dans
   une seule issue** (une « fournée » cohérente). Ne découper que si :
   - domaines vraiment différents (ex. UI recettes vs logique du bot) ;
   - une partie dépend d'une autre (alors 2 issues liées « dépend de #N ») ;
   - la fournée dépasse ce qu'une PR reviewable en ~10 min peut porter.
4. **Arbitrage AVANT création** : poser au mainteneur les questions ambiguës
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
Uniquement le scénario fonctionnel SPÉCIFIQUE à cette issue (quoi tester).
Le « comment » générique (lint, units, build, recette, screenshots) vit dans
le Mode 2 de ce skill — ne pas le recopier dans l'issue.
```

- Si l'issue implique une **migration Prisma** : l'écrire en tête du body
  (`⚠️ Migration de schéma — voir Mode 2`).
- Issue entièrement en **français** (titre court à l'impératif + body). Seuls les
  commits et le code restent en anglais.

## Mode 2 — Réaliser les issues `ready`

Pour chaque issue, dans l'ordre de la file (`gh issue list --label ready`) :

1. **Verrou** : ajouter le label `in-progress`, retirer `ready`. Ce contrôle vaut
   aussi pour une issue demandée explicitement (« traite #N ») : si elle est
   fermée, `in-progress` ou `to-review`, ne PAS la traiter — expliquer pourquoi
   et s'arrêter (quelqu'un s'en occupe déjà, ou c'est déjà livré).
2. **Branche** depuis un `main` à jour : `issue/<n>-<slug>`. Ne jamais commiter
   sur `main` dans ce mode.
3. **Implémenter** en suivant le body de l'issue — le « Hors scope » implicite :
   ne rien faire qui n'est pas dans les critères d'acceptation.
4. **Vérifier pour de vrai** : lint + tests + build, puis le scénario de la
   section Vérification sur le dev server.
5. **Screenshots** : capturer le résultat (états avant/après si pertinent),
   les commiter sous `.github/pr-assets/issue-<n>/` sur la branche.
6. **PR** — trois blocs, dans cet ordre :
   - **Résumé** : 2-3 lignes (quoi + pourquoi), `Closes #<n>`, ⚠️ migration
     éventuelle en tête. Screenshots embarqués, URL de preview.
   - **✅ Vérifié par l'agent** : compte rendu compact de ce qui a été vérifié
     et comment (tests, mesures, recette locale). C'est un rapport, PAS une
     checklist — personne ne refait ces vérifications.
   - **🧪 À recetter** : UNIQUEMENT les angles morts de l'agent (ce qu'il n'a
     pas pu vérifier lui-même), en cases à cocher rédigées **comme un guide
     utilisateur** : des actions simples groupées par page/parcours (« sur la
     page X, clique Y → il se passe Z »), zéro jargon technique. Tout coché =
     le recetteur peut approuver.
   Sur l'issue : retirer `in-progress`, poser `to-review`.
7. **Migration Prisma dans la branche ?** Ne jamais l'appliquer sur la DB
   (partagée avec la prod). La commiter seulement, et l'annoncer en tête de PR :
   `⚠️ Contient une migration — appliquer manuellement avant merge`.
8. Si `main` a bougé entre-temps : rebase avant d'ouvrir la PR, résoudre les
   conflits (typiquement `messages/*.json`).
9. **Merge** : jamais sans le signal formel du mainteneur (bloc « À recetter »
   tout coché + revue du code s'il le souhaite). La forme du signal dépend de
   qui a ouvert la PR : la review GitHub **Approve** si le mainteneur n'en est
   pas l'auteur ; sinon (agent publiant sous son identité — GitHub interdit
   d'approuver sa propre PR) un **commentaire ou message explicite** (« recette
   OK, merge »). **Dérogation** : le mainteneur peut merger avec une recette
   incomplète s'il le dit explicitement (« recette partielle, merge quand
   même ») — l'agent rappelle alors en une ligne ce qui reste non recetté,
   le note dans la PR, puis obéit. Un simple « merge » sans recette ni
   dérogation explicite reste refusé. Ensuite : squash-merge par le mainteneur
   lui-même, ou par l'agent sur son ordre (`gh pr merge --squash
   --delete-branch` — `main` lit « 1 commit = 1 issue » ; le détail vit dans
   la PR). Le `Closes #<n>` ferme l'issue automatiquement. Puis `git pull`
   sur `main`.

Issues indépendantes (aucun fichier partagé, déclaré au cadrage) : paralléliser —
un agent par issue, chacun dans son **worktree** isolé (voir la mémoire
worktree : `.env` à copier, `prisma generate`, port dev dédié).

**Environnement cloud** (session claude.ai/code, GitHub Action) : même avec les
variables d'env, l'egress de la VM est HTTPS-via-proxy uniquement — **le
Postgres brut (5432/6543) est bloqué**, donc dev server authentifié, e2e locaux,
migrate et studio sont impossibles (validé le 2026-08-13, voir DECISIONS).

⚠️ **Chromium n'a aucun réseau sortant depuis la VM** (vérifié 2026-08-16 :
`ERR_CONNECTION_RESET` partout, proxy ou pas, alors que `curl` passe) → recetter
la preview Vercel depuis la VM ne marche PAS. Le découpage des vérifications :
1. Implémenter, puis lint + tests unitaires + build.
2. **Recette locale de ce qui est recettable sans DB** : dev server avec un
   `.env` factice — les pages publiques (login, reset-password…) rendent
   parfaitement. Playwright en local (localhost marche, lui) pour vérifier le
   comportement + screenshots. **Protocole screenshots** : les commiter sous
   `.github/pr-assets/issue-<n>/`, noter le SHA (`git rev-parse HEAD`), puis les
   **retirer dans le commit suivant** (`git rm -r .github/pr-assets`) — ainsi le
   squash ne les emporte jamais dans `main`. Dans la PR, les référencer par
   `https://github.com/<owner>/<repo>/blob/<sha>/<chemin>?raw=true` (épinglées
   au SHA, elles survivent à la suppression de la branche). JAMAIS
   `raw.githubusercontent.com` : 404 sur un repo privé.
3. Pousser tôt, ouvrir la PR (la preview Vercel build en parallèle), `Closes #n`,
   label `to-review`. En session cloud, la branche assignée `claude/…` remplace
   `issue/<n>-slug` — la plateforme l'impose (le push est verrouillé dessus),
   c'est OK : le squash + suppression de branche la rend éphémère. Le slug
   dérive du premier prompt de la session → un prompt court et descriptif
   (« Traite l'issue #7 : bouton précédent du guide ») donne un slug lisible.
4. La PR suit le format du Mode 2 (Résumé / ✅ Vérifié par l'agent /
   🧪 À recetter) — depuis le cloud, le bloc « À recetter » contient d'office
   tout ce qui exige auth ou DB. Donner l'URL de la preview dès qu'elle est
   verte.
5. La purge des comptes de test ne peut pas tourner depuis la VM (DB
   injoignable) : le signaler, purge faite en local plus tard.

Fin de file : petit récap des PRs ouvertes, et signaler ce qui a bloqué le cas
échéant (issue ambiguë → commentaire sur l'issue + label `ready` retiré).
