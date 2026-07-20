import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  stepCountIs,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CHAT_MODEL, buildChefSystemPrompt } from "@/lib/ai/chef";
import { chefTools } from "@/lib/ai/tools";

// Allow streaming responses up to 30s.
export const maxDuration = 30;

export async function POST(req: Request) {
  // Auth check: only logged-in users can talk to the chef (and it costs tokens).
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { messages }: { messages: UIMessage[] } = await req.json();

  // Recall: load what we know about this user and inject it into the prompt (spec §5).
  const preferences = await prisma.preference.findMany({
    where: { userId: user.id },
    select: { type: true, value: true, sentiment: true },
    orderBy: { createdAt: "desc" },
  });

  const result = streamText({
    model: openai(CHAT_MODEL),
    system: buildChefSystemPrompt(user.firstName, preferences),
    messages: await convertToModelMessages(messages),
    // userId comes from the session, NOT from the model (authorization stays ours).
    tools: chefTools(user.id),
    // Let the model call a tool then continue, capped to avoid runaway loops.
    stopWhen: stepCountIs(5),
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
