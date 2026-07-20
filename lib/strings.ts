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
    placeholder: "Demande une recette, une idée de repas…",
    send: "Envoyer",
  },
} as const;
