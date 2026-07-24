import { randomInt } from "node:crypto";
import { getLocale, getTranslations } from "next-intl/server";
import { getCurrentUser } from "@/lib/auth";
import { ChatBox } from "@/components/chat-box";
import { redirect } from "@/i18n/navigation";

// Protected: only logged-in users can talk to the chef.
export default async function ChatPage() {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const t = await getTranslations();

  // Vary the greeting per request, server-side (no client randomness → no hydration
  // mismatch; randomInt keeps the render free of Math.random impurity). Each greeting is
  // an ICU message that folds in the first name (or not) — we pick one index at random.
  const greetings = t.raw("chat.greetings") as string[];
  const index = randomInt(greetings.length);
  const firstName = user.firstName;
  const greeting = t(`chat.greetings.${index}`, {
    hasName: firstName ? "yes" : "no",
    name: firstName ?? "",
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">
        {t("chat.title")}
      </h1>
      <ChatBox greeting={greeting} />
    </main>
  );
}
