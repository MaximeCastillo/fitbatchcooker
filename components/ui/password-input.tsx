"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

// The reveal toggle needs client state, but the login screen is a Server Component —
// so the island is kept as small as possible: just the field and its button.
// Callers pass their own `className` so each field keeps the exact styling it had.
export function PasswordInput({
  className,
  ...inputProps
}: Omit<React.ComponentProps<"input">, "type">) {
  const [isRevealed, setIsRevealed] = useState(false);
  const t = useTranslations("common");
  const ToggleIcon = isRevealed ? EyeOff : Eye;

  return (
    <div className="relative">
      <input
        {...inputProps}
        type={isRevealed ? "text" : "password"}
        // pr-12 keeps the typed value clear of the toggle.
        className={cn(className, "w-full pr-12")}
      />
      {/* 44px tap target (PRINCIPLES §5), centered on the field whatever its height. */}
      <button
        type="button"
        onClick={() => setIsRevealed((wasRevealed) => !wasRevealed)}
        aria-label={t(isRevealed ? "hidePassword" : "showPassword")}
        className="absolute top-1/2 right-0 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground outline-none hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring/40"
      >
        <ToggleIcon className="size-5" aria-hidden />
      </button>
    </div>
  );
}
