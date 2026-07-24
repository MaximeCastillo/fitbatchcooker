---
name: session
description: Runbook d'une session de dev FitBatchCooker — le déroulé début / pendant / fin (relire la doc vivante, petits commits, boucle de vérif, marqueurs pédago, tenue de la doc). À invoquer au début d'une session de travail pour retrouver le rythme habituel.
---

# Session de dev FitBatchCooker

Le **déroulé opérationnel** d'une session. Complète `CLAUDE.md` (la constitution :
posture de coach, langue, conventions, sécurité) — ne le répète pas, s'y réfère.
Objectif : garder le rythme « avancer vite, prendre du plaisir, apprendre au passage ».

## 1. Début de session (se situer avant de coder)

- Relire **`ROADMAP.md`** (à faire / en cours) et **`LEARNING_LOG.md`** (où on en est,
  ce qu'on vient d'apprendre). Survoler les dernières entrées de **`DECISIONS.md`**.
- Garder en tête **`PRINCIPLES.md`** (régularité > précision, modèle protéines/part) et
  **`DESIGN.md`** (direction artistique) pour toute tâche produit / UI.
- Annoncer en **1–2 lignes** le plan de la session, puis attaquer. Pas de sur-préparation
  (l'auteur a tendance à trop préparer — on passe à l'action vite).

## 2. Pendant (la boucle de travail)

- **Découper en étapes logiques**, un **petit commit** par étape (gitmoji anglais, auteur
  Maxime, **jamais** de trailer `Co-Authored-By` — voir `CLAUDE.md` §Git).
- Montrer le **diff pertinent** + le **pourquoi** en une phrase, puis avancer. Pas de gros
  dumps de code.
- **Concept réellement neuf** → marqueur court **« 🆕 Nouveau concept : … »** + **analogie
  Rails**, bref. Doser : expliquer ce qui est neuf *maintenant*, ne pas pondre un pavé à
  chaque ligne. La friction tue le plaisir.
- **Textes UI** → toujours dans `lib/strings.ts`, jamais en dur (prêt pour le multilingue).
  **Code et commentaires en anglais**, discussion en français.
- **Sécurité** : au bon moment, rappeler/appliquer les fondamentaux (secrets & IA côté
  serveur, requêtes scopées à l'user, validation des entrées **et** des sorties du modèle).

## 3. Boucle de vérif (avant de dire « c'est fait »)

Vérifier pour de vrai, **pas à l'œil**. Sur les fichiers touchés :

```bash
npx tsc --noEmit                     # types
npx eslint <fichiers modifiés>       # lint (PAS `next lint` : retiré en Next 16)
```

Puis, pour une route touchée : `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/<route>`
et jeter un œil aux **logs du dev server**. Un `307` sur une route protégée = redirection
login attendue (la page a compilé). Ce qui reste **visuel** (animations, drag, rendu) →
le demander à l'auteur, on ne peut pas le voir en curl.

## 4. Fin de session (tenir la doc — courte !)

- **`LEARNING_LOG.md`** : ajouter un **bilan daté** (ce qu'on a construit, concepts appris,
  victoires). C'est le journal de progression — concis, donnant *envie* de relire.
- **`DECISIONS.md`** : entrée datée **très courte** si décision/évolution notable (append-only,
  on ne réécrit jamais le passé).
- **`ROADMAP.md`** : retirer les items livrés, les résumer dans « Livré récemment ».
- **`PROJECT_SPEC.md`** : mettre à jour seulement si le *cœur* produit/archi a changé.
- Proposer un dernier commit de doc, puis clore.

## Rappel du cap

KISS & YAGNI. La solution ennuyeuse et lisible plutôt que maligne. Enseigner la **stack et
les choix d'archi** (le pourquoi) est un livrable de premier plan — pas la plomberie bas
niveau. Test de réussite : à la fin, l'auteur sait ré-expliquer ce qu'on a construit.
