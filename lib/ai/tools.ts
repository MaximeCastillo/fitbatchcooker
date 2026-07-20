import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { savePreferenceInput } from "@/lib/ai/schemas";

// Tools are built per-request with the authenticated userId closed over, so writes are
// ALWAYS scoped to the logged-in user — never to an id the model could propose.
export function chefTools(userId: string) {
  return {
    save_preference: tool({
      description:
        "Enregistre une préférence de l'utilisateur LIÉE À L'ALIMENTATION, LA CUISINE OU LA NUTRITION (goût, aversion, contrainte alimentaire, garde-manger, occasion de repas, objectif). NE PAS appeler pour un sujet hors de ce domaine (ex. loisirs non alimentaires comme les voitures).",
      inputSchema: savePreferenceInput,
      execute: async (input) => {
        const preference = await prisma.preference.create({
          data: { userId, ...input },
        });
        return { saved: true, id: preference.id };
      },
    }),
  };
}
