// Centralized UI copy (spec §7ter): no hardcoded strings scattered in components.
// One place to change wording — and the natural seam for next-intl when a 2nd
// language becomes a real need. (App identity like APP_NAME lives in constants.ts.)
export const strings = {
  home: {
    seeRecipes: "Voir les recettes",
    title: "Tes repas protéinés, planifiés à l'avance.",
    subtitle:
      "Compose tes journées, remplis ta jauge de protéines, et obtiens ta liste de plats à préparer.",
    ctaPrimary: "Créer un compte",
    ctaSecondary: "Voir les recettes",
    steps: [
      {
        title: "Compose ta semaine",
        text: "Choisis tes plats jour par jour, à partir de tes recettes.",
      },
      {
        title: "Remplis ta jauge",
        text: "Chaque journée passe au vert quand tu atteins ton objectif protéines.",
      },
      {
        title: "Cuisine ton batch",
        text: "Ta liste de plats à préparer d'avance, en nombre de parts.",
      },
    ],
  },
  nav: {
    batch: "Mes batchs",
    recipes: "Recettes",
    book: "Mes recettes",
    chat: "Le chef",
    login: "Se connecter",
    logout: "Se déconnecter",
  },
  batch: {
    defaultName: (dateLabel: string) => `Batch du ${dateLabel}`,
    untitled: "Sans titre",
    title: "Mes batchs",
    subtitle: "Tes lots de plats à cuisiner d'avance.",
    new: "Nouveau batch",
    empty: "Tu n'as pas encore de batch. Crée ton premier lot de plats !",
    nameLabel: "Nom du batch",
    days: (n: number) => `${n} jour${n > 1 ? "s" : ""}`,
    dishes: (n: number) => `${n} plat${n > 1 ? "s" : ""}`,
    composerSoon: "La composition (glisser-déposer) arrive à l'étape suivante.",
  },
  login: {
    title: "Connexion",
    titleSignup: "Créer un compte",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    missingFields: "Renseigne un email et un mot de passe.",
    noAccount: "Pas encore de compte ?",
    haveAccount: "Déjà un compte ?",
    // Value panel
    panelTitle: "Tes repas protéinés, planifiés à l'avance.",
    panelSubtitle: "Compose ta semaine, remplis ta jauge de protéines, et obtiens ta liste de plats à préparer.",
    benefits: [
      "Un objectif protéines par jour, à ton rythme",
      "Chaque journée qui passe au vert",
      "Un chef qui apprend tes goûts",
    ],
  },
  recipes: {
    title: "Recettes",
    empty: "Aucune recette pour l'instant.",
    protein: (grams: number) => `${grams} g de protéines / portion`,
    servings: (count: number) => `${count} portion${count > 1 ? "s" : ""}`,
    calories: (kcal: number) => `${kcal} kcal / portion`,
    save: "Sauvegarder",
    saved: "Enregistré ✓",
    remove: "Retirer",
  },
  book: {
    title: "Mes recettes",
    empty: "Tu n'as pas encore sauvegardé de recette.",
    browse: "Parcourir les recettes",
  },
  chat: {
    title: "Le chef",
    // Static greetings rendered by the UI — no LLM call, no tokens spent. One is picked
    // at random (server-side) on each visit to vary and surprise the user.
    greetings: [
      (n: string | null) =>
        `Bonjour${n ? ` ${n}` : ""} 👋 Qu'est-ce qu'on cuisine aujourd'hui ?`,
      (n: string | null) =>
        `Salut${n ? ` ${n}` : ""} 💪 Prêt à faire le plein de protéines ?`,
      (n: string | null) =>
        `Hello${n ? ` ${n}` : ""} 👨‍🍳 On prépare quoi de bon pour la semaine ?`,
      (n: string | null) =>
        `Ravi de te revoir${n ? `, ${n}` : ""} ! 🍗 On attaque le batch cooking ?`,
      (n: string | null) =>
        `Coucou${n ? ` ${n}` : ""} 🥗 Une envie précise, ou je te surprends ?`,
    ],
    placeholder: "Demande une recette, une idée de repas…",
    send: "Envoyer",
  },
  profile: {
    title: "Profil",
    firstName: "Prénom",
    proteinTarget: "Objectif protéines (g/jour)",
    proteinHint: "On conseille ~2 g/kg de masse corporelle — à toi de fixer ta cible.",
    save: "Enregistrer",
    saved: "Profil enregistré ✓",
  },
} as const;
