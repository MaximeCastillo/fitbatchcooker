import { z } from "zod";

// Pure Zod schemas for the chef's tools — NO DB imports, so they're cheap to unit-test.
// This is our "validate the model's output" guard (spec §5 / bot security).
export const savePreferenceInput = z.object({
  type: z
    .string()
    .min(1)
    .describe(
      "Catégorie libre: goût, aversion, contrainte, garde-manger, occasion, objectif…",
    ),
  value: z
    .string()
    .min(1)
    .describe("La préférence en une phrase courte. Ex: « adore le poulet »"),
  sentiment: z
    .enum(["like", "dislike", "neutral"])
    .optional()
    .describe("Ressenti de l'utilisateur vis-à-vis de cette préférence"),
  note: z.string().optional().describe("Détail optionnel"),
});
