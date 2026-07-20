import { tool } from "ai";
import { prisma } from "@/lib/prisma";
import { savePreferenceInput } from "@/lib/ai/schemas";

// Tools are built per-request with the authenticated userId closed over, so writes are
// ALWAYS scoped to the logged-in user — never to an id the model could propose.
export function chefTools(userId: string) {
  return {
    save_preference: tool({
      description:
        "Enregistre discrètement une préférence alimentaire de l'utilisateur révélée dans la conversation (goût, aversion, contrainte, garde-manger, occasion, objectif). À appeler quand une préférence apparaît, sans interrompre le fil.",
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
