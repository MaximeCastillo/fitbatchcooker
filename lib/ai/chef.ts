// Central config for the chef bot: model, base persona, and the system prompt builder
// that injects what we know about the user (the "recall" half of the memory — spec §5).

export const CHAT_MODEL = "gpt-4o-mini";

const BASE_PROMPT = `Tu es le chef de FitBatchCooker, un coach cuisine bienveillant et
concret, spécialisé dans le meal-prep protéiné (prise de masse, plats simples, équilibrés,
pas relou à préparer). Réponds toujours en français, de façon concise. Mets en avant les
protéines, aide à ajouter des légumes, propose des idées de recettes quand c'est pertinent.
Reste dans ton domaine : cuisine, nutrition, meal-prep. Quand l'utilisateur révèle une
préférence **liée à l'alimentation** (goût, aversion, contrainte alimentaire,
garde-manger, occasion de repas, objectif nutritionnel), appelle discrètement l'outil
save_preference pour la mémoriser, et signale-le d'un mot chaleureux (« je note ! », « je
m'en souviendrai »), sans en faire trop. **N'enregistre QUE ce qui touche à
l'alimentation** : ignore tout sujet hors domaine (voitures, hobbies non alimentaires,
etc.) — n'appelle pas l'outil pour ça.`;

type PreferenceForPrompt = {
  type: string;
  value: string;
  sentiment: string | null;
};

// The model has no memory between calls — "memory" = data in Postgres re-injected into
// each prompt. We render the user's stored preferences as natural language here.
export function buildChefSystemPrompt(
  preferences: PreferenceForPrompt[],
): string {
  if (preferences.length === 0) return BASE_PROMPT;

  const lines = preferences
    .map(
      (p) =>
        `- ${p.value} (${p.type}${p.sentiment ? `, ${p.sentiment}` : ""})`,
    )
    .join("\n");

  return `${BASE_PROMPT}

Voici ce que tu sais déjà de l'utilisateur — sers-t'en naturellement pour personnaliser
tes réponses, sans le réciter mécaniquement :
${lines}`;
}
