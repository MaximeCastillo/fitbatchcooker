"use client";

import { useState, type FormEvent } from "react";
import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

// Client Component: manages the chat state and streams the chef's replies.
// It POSTs to /api/chat by default (our route handler).
export function ChatBox() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status } = useChat();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="flex flex-1 flex-col gap-4">
      <ul className="flex flex-1 flex-col gap-3">
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
          placeholder={strings.chat.placeholder}
          className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <Button type="submit" disabled={status !== "ready"}>
          {strings.chat.send}
        </Button>
      </form>
    </div>
  );
}
