"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { IngredientCategory } from "@/lib/generated/prisma/enums";
import { INGREDIENT_PICTO } from "@/lib/ingredients";
import {
  loadRecipesByIngredient,
  type RecipeCardData,
} from "@/app/[locale]/recipes/actions";
import { RecipeCard } from "@/components/recipe-card";
import { SaveToggle } from "@/components/save-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SelectedIngredient = {
  id: string;
  name: string;
  category: IngredientCategory;
};

// Reverse-search modal (Marmiton-style): the recipes that use the tapped ingredient,
// with the usual bookmark toggle + infinite scroll. Open when `ingredient` is non-null.
export function IngredientRecipesModal({
  ingredient,
  canSave,
  onClose,
}: {
  ingredient: SelectedIngredient | null;
  canSave: boolean;
  onClose: () => void;
}) {
  const t = useTranslations("ingredients");
  const [recipes, setRecipes] = useState<RecipeCardData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const loadingRef = useRef(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // (Re)load page 1 whenever a new ingredient is opened.
  useEffect(() => {
    if (!ingredient) return;
    let active = true;
    loadingRef.current = true;
    loadRecipesByIngredient(ingredient.id, null).then((res) => {
      if (!active) return;
      setRecipes(res.recipes);
      setCursor(res.nextCursor);
      loadingRef.current = false;
    });
    return () => {
      active = false;
    };
  }, [ingredient]);

  // Infinite scroll inside the modal's scroll area.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || cursor === null || !ingredient) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      loadRecipesByIngredient(ingredient.id, cursor).then((res) => {
        setRecipes((prev) => [...prev, ...res.recipes]);
        setCursor(res.nextCursor);
        loadingRef.current = false;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, ingredient]);

  return (
    <Dialog
      open={ingredient !== null}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-lg">
        {ingredient && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span aria-hidden>{INGREDIENT_PICTO[ingredient.category]}</span>
                {t("recipesWith", { name: ingredient.name })}
              </DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              {recipes.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  {t("noRecipeWith")}
                </p>
              ) : (
                <ul className="grid gap-3">
                  {recipes.map((recipe) => (
                    <li key={recipe.id}>
                      <RecipeCard
                        recipe={recipe}
                        href={`/recipes/${recipe.id}`}
                        bookmark={
                          canSave ? (
                            <SaveToggle
                              recipeId={recipe.id}
                              saved={recipe.saved}
                            />
                          ) : undefined
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
              {cursor !== null && (
                <div ref={sentinelRef} className="h-8" aria-hidden />
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
