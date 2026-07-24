import { randomInt } from "node:crypto";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { ChatBox } from "@/components/chat-box";
import { strings } from "@/lib/strings";

// Protected: only logged-in users can talk to the chef.
export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Vary the greeting per request, server-side (no client randomness → no hydration
  // mismatch; randomInt keeps the render free of Math.random impurity).
  const { greetings } = strings.chat;
  const greeting = greetings[randomInt(greetings.length)](user.firstName);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {strings.chat.title}
      </h1>
      <ChatBox greeting={greeting} />
    </main>
  );
}
