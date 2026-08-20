---
name: issues
description: Transformer des retours bruts (démo, idées, bugs) en issues GitHub prêtes pour un agent autonome, puis réaliser les issues `ready` — une branche par issue, une PR courte avec screenshots. À invoquer soit pour forger des issues depuis des retours, soit pour traiter la file d'issues.
---

# /issues — pointeur vers le plugin (AUCUNE substance ici)

La substance de ce skill vit dans le plugin `issues` de la marketplace
`MaximeCastillo/claude-plugins`. Ce fichier n'est qu'un pointeur — ne JAMAIS
y ajouter de contenu : toute amélioration du workflow s'édite dans le repo
claude-plugins, pas ici.

- **Session locale** (le skill `issues:issues` est chargé) : invoquer
  `issues:issues` avec les mêmes arguments et suivre ses instructions.
- **Session cloud** (les plugins ne sont pas résolus au démarrage du
  conteneur) : lire `plugins/issues/skills/issues/SKILL.md` du repo
  `MaximeCastillo/claude-plugins` via le serveur MCP GitHub, puis suivre ces
  instructions comme si le skill était chargé.
