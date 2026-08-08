"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

// Client Component: manages the chat state and streams the chef's replies.
// It POSTs to /api/chat by default (our route handler).
export function ChatBox({ greeting }: { greeting: string }) {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();
  const t = useTranslations("chat");
  // The chat route lives outside the [locale] segment, so it can't resolve the UI locale
  // on its own. We know it for sure here (this component renders inside [locale]), so we
  // send it along and the chef answers in the language the UI is actually shown in.
  const locale = useLocale();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text }, { body: { locale } });
    setInput("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-3">
        {messages.length === 0 && (
          <li className="text-sm text-muted-foreground">{greeting}</li>
        )}
        {messages.map((message) => (
          <li
            key={message.id}
            className={message.role === "user" ? "text-right" : "text-left"}
          >
            <span className="inline-block max-w-[85%] whitespace-pre-wrap rounded-lg bg-muted px-3 py-2 text-left text-sm">
              {message.parts.map((part, index) =>
                part.type === "text" ? (
                  <span key={index}>{part.text}</span>
                ) : null,
              )}
            </span>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t("placeholder")}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={status !== "ready"}>
          {t("send")}
        </Button>
      </form>
    </div>
  );
}
