"use client";

import { useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toggleSaveRecipe } from "@/app/recipes/actions";
import { strings } from "@/lib/strings";

// Optimistic save toggle: the button flips INSTANTLY on click (useOptimistic), before
// the server responds — so it feels immediate despite the DB round-trip. When the Server
// Action completes and the page revalidates, the `saved` prop updates and the optimistic
// value reconciles with the real one (and reverts automatically if the action failed).
export function SaveToggle({
  recipeId,
  saved,
}: {
  recipeId: string;
  saved: boolean;
}) {
  const [optimisticSaved, setOptimisticSaved] = useOptimistic(saved);
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={optimisticSaved ? "secondary" : "outline"}
      size="sm"
      className="w-full"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          setOptimisticSaved(!optimisticSaved);
          await toggleSaveRecipe(recipeId);
        })
      }
    >
      {optimisticSaved ? strings.recipes.saved : strings.recipes.save}
    </Button>
  );
}
