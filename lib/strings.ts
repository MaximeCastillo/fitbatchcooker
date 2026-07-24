// Centralized UI copy (spec §7ter): no hardcoded strings scattered in components.
// One place to change wording — and the natural seam for next-intl when a 2nd
// language becomes a real need. (App identity like APP_NAME lives in constants.ts.)
export const strings = {
  common: {
    undo: "Annuler",
  },
  home: {
    seeRecipes: "Voir les recettes",
    title: "Tes repas protéinés, planifiés à l'avance.",
    subtitle:
      "Compose tes journées, remplis ta jauge de protéines, et obtiens ta liste de recettes à préparer.",
    ctaPrimary: "Créer un compte",
    ctaSecondary: "Voir les recettes",
    heroCaption: "Deux jours au vert, un en cours.",
    steps: [
      {
        title: "Compose ta semaine",
        text: "Choisis tes recettes jour par jour.",
      },
      {
        title: "Remplis ta jauge",
        text: "Chaque journée passe au vert quand tu atteins ton objectif protéines.",
      },
      {
        title: "Cuisine ton batch",
        text: "Ta liste de recettes à préparer d'avance, en nombre de parts.",
      },
    ],
  },
  nav: {
    batch: "Mes batchs",
    recipes: "Recettes",
    book: "Mes recettes",
    chat: "Le chef",
    account: "Mon compte",
    login: "Se connecter",
    logout: "Se déconnecter",
  },
  batch: {
    defaultName: (dateLabel: string) => `Batch du ${dateLabel}`,
    untitled: "Sans titre",
    title: "Mes batchs",
    subtitle: "Tes lots de recettes à cuisiner d'avance.",
    new: "Nouveau batch",
    empty: "Tu n'as pas encore de batch. Crée ton premier lot de recettes !",
    nameLabel: "Nom du batch",
    days: (n: number) => `${n} jour${n > 1 ? "s" : ""}`,
    dishes: (n: number) => `${n} recette${n > 1 ? "s" : ""}`,
    dayLabel: (n: number) => `Jour ${n}`,
    delete: "Supprimer le batch",
    dayDeleted: "Jour supprimé",
    deleted: "Batch supprimé",
    progressLabel: "Progression du batch",
    averageLabel: "g / jour en moy.",
    emptyDay: "Aucune recette",
    removeDish: "Retirer la recette",
    addDay: "Ajouter un jour",
    removeDayLabel: "Supprimer le jour",
    noTarget: "Définis ton objectif protéines pour activer les jauges.",
    setTarget: "Aller à mon compte",
    toCook: "À cuisiner",
    toCookHint: "Ton lot de recettes à préparer d'avance.",
    perServing: (g: number | null) => `${g ?? "—"} g / portion`,
    times: (n: number) => `×${n}`,
    recipes: "Recettes",
    searchPlaceholder: "Rechercher…",
    noRecipe: "Aucune recette.",
    dragHint: "Glisse une recette sur un jour (Maj = dupliquer), ou touche +.",
    tapHint: "Touche + pour ajouter une recette à un jour.",
    preview: "Aperçu de la recette",
    add: "Ajouter la recette",
    addToDay: (title: string) => `Ajouter « ${title} » à…`,
    removeZone: "Relâche pour ranger cette recette",
    dropHere: "Glisse une recette ici",
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
    panelSubtitle: "Compose ta semaine, remplis ta jauge de protéines, et obtiens ta liste de recettes à préparer.",
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
    detail: {
      back: "Toutes les recettes",
      stepsTitle: "Préparation",
      stepsEmpty: "La procédure de cette recette arrive bientôt.",
      // Founding principle §6: macros are assumed approximate — say so in the UI.
      approxNote: "Valeurs approximatives — l'important, c'est la régularité.",
    },
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
  account: {
    title: "Mon compte",
    // Prominent header: which account am I on right now? (The whole point of this page.)
    connectedAs: "Connecté en tant que",
    // Profile section reuses strings.profile.* for its field labels.
    profileSection: "Profil",
    // Appearance — light/dark/system theme toggle.
    appearanceSection: "Apparence",
    themeLight: "Clair",
    themeDark: "Sombre",
    themeSystem: "Système",
    // Change email
    emailSection: "Adresse email",
    emailHint: "Un email de confirmation sera envoyé à la nouvelle adresse.",
    newEmail: "Nouvelle adresse email",
    changeEmail: "Changer d'email",
    emailSent: "Un email de confirmation a été envoyé à ta nouvelle adresse.",
    emailInvalid: "Cette adresse email n'est pas valide.",
    emailSame: "C'est déjà ton adresse actuelle.",
    emailTaken: "Cette adresse est déjà utilisée par un autre compte.",
    emailError: "Impossible de changer l'adresse pour l'instant. Réessaie.",
    // Change password
    passwordSection: "Mot de passe",
    currentPassword: "Mot de passe actuel",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirme le nouveau mot de passe",
    changePassword: "Changer de mot de passe",
    passwordUpdated: "Mot de passe mis à jour ✓",
    passwordWrong: "Mot de passe actuel incorrect.",
    passwordTooShort: "Le nouveau mot de passe doit faire au moins 8 caractères.",
    passwordMismatch: "Les deux mots de passe ne correspondent pas.",
    passwordError: "Impossible de changer le mot de passe pour l'instant. Réessaie.",
  },
} as const;
