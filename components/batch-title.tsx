"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { renameBatch } from "@/app/[locale]/batch/actions";

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
  const t = useTranslations("batch");

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
      aria-label={t("nameLabel")}
      className="w-full border-b-2 border-transparent bg-transparent font-display text-3xl font-bold uppercase tracking-wide outline-none hover:border-border focus:border-primary"
    />
  );
}
