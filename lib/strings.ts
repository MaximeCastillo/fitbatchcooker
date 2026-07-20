// Centralized UI copy (spec §7ter): no hardcoded strings scattered in components.
// One place to change wording — and the natural seam for next-intl when a 2nd
// language becomes a real need. (App identity like APP_NAME lives in constants.ts.)
export const strings = {
  home: {
    seeRecipes: "Voir les recettes",
  },
  nav: {
    recipes: "Recettes",
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
  },
} as const;
