# Direction artistique — FitBatchCooker

> Court et **stable**. But : **retrouver la cohérence visuelle** d'une session à
> l'autre. Les tokens vivent dans le code (`app/globals.css`, `app/layout.tsx`) — ce
> document explique **l'intention** derrière. Quand la DA évolue : mettre à jour les
> tokens **et** ce fichier.

---

## Identité en une phrase

**Audacieux mais simple**, food + fitness, **ludique**. Un SaaS qui donne envie, pas
une app de tracking austère.

## Palette (source de vérité : `app/globals.css`)

Deux couleurs de marque, **un seul accent verrouillé** (on ne panache pas).

- **Vert `--primary`** (`#16a34a` · dark `#34d27b`) — couleur maîtresse **et** signal
  de réussite (« jour au vert », objectif atteint). Le vert = « c'est bon, c'est
  validé ».
- **Orange chaud `--accent-warm`** (`#f97316` · dark `#fb923c`) — énergie, appétit,
  chiffres qui claquent (protéines, quota ×N). **Ponctuel, jamais dominant.**
- **Neutres légèrement verdis** (fond `#f4f6f1`, texte `#16201a`, muted `#edf0e9`…) —
  choisis, pas un gris par défaut.
- `--destructive` `#dc2626` — actions destructrices **uniquement**.
- **Rayon** de base `--radius: 0.75rem` (échelle `sm`→`4xl` dérivée).
- **Dark mode complet** (`.dark`), pensé — pas une inversion naïve.

Changer l'identité = éditer ces variables (**reskin complet piloté par tokens**).

## Typographie (source : `app/layout.tsx`)

- **Barlow** — corps / sans (`--font-sans`).
- **Barlow Condensed** — display / titres (`--font-display`), **en MAJUSCULES**,
  tracking large → registre **athlétique / sport**.
- **Geist Mono** — chiffres et macros (protéines, quotas) → lisibilité tabulaire,
  côté « données ».

## Layout

- **Shell à sidebar** (`components/app-shell.tsx`) : navigation latérale persistante
  (Batchs, Recettes, Mes recettes, Le chef).
- Conteneurs `max-w`, **mobile-first** (Tailwind) → responsive gratuit.

## Motif signature : la jauge de protéines (`components/protein-gauge.tsx`)

**LE** symbole du produit : un **contenant qui se remplit** de protéines et se
**scelle en vert + coche** une fois l'objectif atteint.

- Remplissage animé (dégradé vert), **bulles « chaudron »** discrètes qui montent
  (vie / cuisson).
- **Sceau** vert (badge coche) au « vert », animé (zoom-in).
- Décliné partout : jauge par jour du batch, hero de la home.
- Respecte **toujours** `prefers-reduced-motion`.

## Motion

- **Douce et utile**, jamais gratuite (anti-slop). Micro-interactions :
  `-translate-y` / `scale` au clic, transitions couleur/hauteur ~700 ms.
- Patterns maison : barre de décompte de l'undo, sceau qui apparaît, bulles du
  chaudron.
- Tout ce qui bouge se coupe en `motion-reduce`.

## Ton & gamification

- « Jour au vert », progression du batch, sceau de complétude → **satisfaction
  visible**.
- Copie UI **en français, centralisée dans `lib/strings.ts`**.
- Nommage : **« recette » partout** (catalogue *et* instance) — cf. `ROADMAP.md`.

## Garde-fous anti-slop

- **Un seul accent** (vert), verrouillé sur toute la page ; l'orange reste ponctuel.
- **Pas** de dégradé « IA violet/bleu », pas de glassmorphism gratuit.
- Icônes : **`lucide-react`** (déjà en place), **une seule famille**, cohérentes.

## Pistes DA (plus tard)

- **Onboarding léger** + **empty states** qui guident.
- **Mascotte-guide** (2D puis éventuellement 3D) — chef contextuel par page.
- **Célébration 3D** du « jour scellé au vert » (premier moment 3D, périmètre
  maîtrisé).
