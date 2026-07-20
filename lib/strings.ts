// Centralized UI copy (spec §7ter): no hardcoded strings scattered in components.
// One place to change wording — and the natural seam for next-intl when a 2nd
// language becomes a real need. (App identity like APP_NAME lives in constants.ts.)
export const strings = {
  home: {
    seeRecipes: "Voir les recettes",
  },
  nav: {
    recipes: "Recettes",
    book: "Mes recettes",
    chat: "Le chef",
    login: "Se connecter",
    logout: "Se déconnecter",
  },
  login: {
    title: "Connexion",
    email: "Email",
    password: "Mot de passe",
    signIn: "Se connecter",
    signUp: "Créer un compte",
    missingFields: "Renseigne un email et un mot de passe.",
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
