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
