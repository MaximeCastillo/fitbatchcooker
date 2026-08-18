# Checklist avant prod (ouverture à de vrais utilisateurs)

Décisions **volontairement provisoires** prises pour aller vite en MVP/dev. À revoir
**avant** d'ouvrir l'app à de vrais utilisateurs. Chaque point renvoie à son entrée
dans `DECISIONS.md`.

- [ ] **Séparer les bases dev / prod.** Aujourd'hui une seule base Supabase (plan free)
      pour les deux. Créer une base prod dédiée (2ᵉ projet Supabase ou branching) **+** un
      GitHub Action `prisma migrate deploy` comme étape de release. _(DECISIONS — 2026-07-17)_
      **Conséquence directe :** les comptes de test end-to-end (`e2e+…@example.com`) sont
      créés **dans la base de prod**, d'où le besoin de les purger à la main (page `/admin`,
      issue #11). Le jour où les bases sont séparées, cette purge n'a plus de raison d'être
      côté prod — c'est la vraie correction, la page admin n'est qu'un pansement.
- [ ] **Réactiver la confirmation par email** (Supabase → Authentication → Providers →
      Email). Désactivée en dev pour un signup immédiat. _(DECISIONS — 2026-07-20)_
- [ ] **Rate limiting du bot** (par user) sur `/api/chat` — éviter le spam / détournement
      de tokens. _(DECISIONS — 2026-07-20, sécurité bot)_
- [ ] **Restreindre les signups** (allowlist / invitation) tant que la clé OpenAI est
      partagée — sinon n'importe qui peut créer un compte et brûler tes tokens.
- [ ] **BYO-key par user** (spec §6) — chaque user fournit sa clé (stockée chiffrée) et
      paie ses propres tokens. Le vrai fix économique **et** sécurité.
- [ ] **Politique de push / branches.** En MVP on **commite et push directement sur `main`
      sans validation** (assumé : pas de conséquence prod). Avant d'ouvrir : brancher + PR +
      review, au moins pour les changements sensibles (auth, migrations, secrets).

Idées futures à intégrer au fil de l'eau : RLS en défense en profondeur, revue des
clés/secrets, domaine `fitbatchcooker.com`, politique de mots de passe, rate limiting.

## Registre : tout ce qui dépend de la base unique partagée

Le jour où on sépare les bases (1ᵉʳ point ci-dessus), on repasse sur CHAQUE entrée.
**Règle de tenue** : toute PR qui ajoute du code, un garde-fou ou un commentaire motivé
par la base unique ajoute sa ligne ici, dans la même PR. (Balayage initial : 2026-08-17.)

**Mécanismes qui n'existent qu'à cause d'elle :**
- [ ] `e2e/purge-test-users.ts` + `e2e/global-teardown.ts` — purge chirurgicale des
      comptes `e2e+` : à remplacer par un reset de la base de test. Les orphelins
      `auth.users` (pas de service-role key dans les tests) disparaissent avec.
- [ ] `e2e/helpers.ts` — préfixe `e2e+` et commentaires de purge (idem en tête de
      `e2e/smoke.spec.ts` et `e2e/onboarding.spec.ts`).
- [ ] `playwright.config.ts` — `fullyParallel: false` / `workers: 1` imposés par la
      cohabitation des données : à relever. `globalTeardown` à retirer avec la purge.
- [ ] `.github/workflows/ci.yml` — secrets pointés sur la base unique ; commentaire
      « shared DB » ; et une étape `prisma migrate deploy` (base de test) à AJOUTER,
      aujourd'hui interdite.
- [ ] `prisma/seed.ts` — prudence non-destructive calibrée pour des données réelles :
      relâchable sur une base dev jetable (garder la version prudente pour la prod).
- [ ] `app/[locale]/admin/` + `lib/admin.ts` + `lib/supabase/admin.ts` — la page `/admin`
      (issue #11) : le bouton « purger les comptes de test », le badge « test » et le
      préfixe `e2e+` de `lib/admin.ts` n'existent que parce que les comptes e2e atterrissent
      en prod. Bases séparées = ce pan de la page disparaît (la gestion des vrais comptes,
      elle, reste légitime).

**Garde-fous à lever :**
- [ ] `.github/workflows/ci.yml` (en-tête) — « NEVER run prisma migrate here ».
- [ ] `.claude/skills/issues/SKILL.md` — « migration jamais appliquée depuis une
      branche », rituel `⚠️ appliquer manuellement avant merge`, « e2e rouges attendus
      sur une PR à migration », « purge impossible depuis la VM » : tout ce bloc se
      simplifie ou disparaît.

**Doc à actualiser :**
- [ ] `README.md` — stratégie « pas de migrate au build » à réécrire (release =
      `migrate deploy` sur la prod) ; instructions qui supposent une seule base
      (installation, tableau des variables, `prisma studio`).
- [ ] `.env.example` — une seule paire d'URLs de connexion : documenter dev / prod
      (/ test) distinctement.
- [ ] `PROJECT_SPEC.md` — stack « Supabase » au singulier + section connexion
      Prisma/pooling : refléter le multi-projet.
- [ ] `DECISIONS.md` / `LEARNING_LOG.md` — ne RIEN réécrire (append-only) : une
      nouvelle entrée datée actera la séparation.
