"use client";

import { useOptimistic, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { toggleSaveRecipe } from "@/app/[locale]/recipes/actions";

// Optimistic save toggle, rendered as a bookmark icon. The bookmark fills INSTANTLY on
// click (useOptimistic), before the server responds — so it feels immediate despite the
// DB round-trip. When the Server Action completes and the page revalidates, the `saved`
// prop updates and the optimistic value reconciles (and reverts if the action failed).
// 44px hit area (tap-first, PRINCIPLES §5).
export function SaveToggle({
  recipeId,
  saved,
}: {
  recipeId: string;
  saved: boolean;
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();
  const t = useTranslations("recipes");

  return (
    <button
      type="button"
      aria-label={optimisticSaved ? t("remove") : t("save")}
      aria-pressed={optimisticSaved}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimisticSaved(!optimisticSaved);
          await toggleSaveRecipe(recipeId);
        })
      }
      className={cn(
        "grid size-11 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50",
        optimisticSaved && "text-primary hover:text-primary",
      )}
    >
      <Bookmark className={cn("size-5", optimisticSaved && "fill-primary")} />
    </button>
  );
}
