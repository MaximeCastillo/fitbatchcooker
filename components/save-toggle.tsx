"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { toggleSaveRecipe } from "@/app/[locale]/recipes/actions";

// Save/favorite toggle, rendered as a bookmark icon. The bookmark fills INSTANTLY on click
// and STAYS filled — we own the saved state locally (seeded from the `saved` prop) so it
// survives the Server Action round-trip. (We can't rely on the prop reconciling back: the
// recipe list that renders us freezes its data in useState, so revalidatePath never reaches
// this prop — an earlier bug where the fill reverted until a full reload.) We only roll back
// if the action actually throws. 44px hit area (tap-first, PRINCIPLES §5).
export function SaveToggle({
  recipeId,
  saved,
}: {
  recipeId: string;
  saved: boolean;
}) {
  const [isSaved, setIsSaved] = useState(saved);
  const [pending, startTransition] = useTransition();
  const t = useTranslations("recipes");

  return (
    <button
      type="button"
      aria-label={isSaved ? t("remove") : t("save")}
      aria-pressed={isSaved}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const next = !isSaved;
          setIsSaved(next); // optimistic, and kept after the transition resolves
          try {
            await toggleSaveRecipe(recipeId);
          } catch {
            setIsSaved(!next); // only revert if the write actually failed
          }
        })
      }
      className={cn(
        "grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        isSaved && "text-primary hover:text-primary",
      )}
    >
      <Bookmark className={cn("size-5", isSaved && "fill-primary")} />
    </button>
  );
}
