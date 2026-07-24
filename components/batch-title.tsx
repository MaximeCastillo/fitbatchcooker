"use client";

import { useState, useTransition } from "react";
import { renameBatch } from "@/app/batch/actions";
import { strings } from "@/lib/strings";

// Inline-editable batch title (Notion-style): saves on blur / Enter, no separate
// button. Full width so long names aren't cut off.
export function BatchTitle({
  planId,
  initialName,
}: {
  planId: string;
  initialName: string;
}) {
  const [name, setName] = useState(initialName);
  const [, startTransition] = useTransition();

  function save() {
    const clean = name.trim();
    if (clean !== initialName.trim()) {
      startTransition(() => renameBatch(planId, clean));
    }
  }

  return (
    <input
      value={name}
      onChange={(e) => setName(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          e.currentTarget.blur();
        }
      }}
      aria-label={strings.batch.nameLabel}
      className="w-full border-b-2 border-transparent bg-transparent font-display text-3xl font-bold uppercase tracking-wide outline-none hover:border-border focus:border-primary"
    />
  );
}
