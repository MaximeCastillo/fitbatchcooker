"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import type { IngredientCategory } from "@/lib/generated/prisma/enums";
import { ingredientPicto } from "@/lib/ingredients";
import {
  loadRecipesByIngredient,
  type RecipeCardData,
} from "@/app/[locale]/recipes/actions";
import { RecipeCard } from "@/components/recipe-card";
import { RecipeGridSkeleton } from "@/components/recipe-grid-skeleton";
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
  picto: string | null;
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
                <span aria-hidden>{ingredientPicto(ingredient)}</span>
                {t("recipesWith", { name: ingredient.name })}
              </DialogTitle>
            </DialogHeader>
            {/* Keyed by id → the list remounts fresh for each ingredient, so we never
                flash the previous ingredient's recipes while the new ones load. */}
            <IngredientRecipes
              key={ingredient.id}
              ingredientId={ingredient.id}
              canSave={canSave}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function IngredientRecipes({
  ingredientId,
  canSave,
}: {
  ingredientId: string;
  canSave: boolean;
}) {
  const t = useTranslations("ingredients");
  const [recipes, setRecipes] = useState<RecipeCardData[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(true);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Initial page. This component is remounted per ingredient (via key), so state starts
  // empty + loading — no stale results from a previously opened ingredient.
  useEffect(() => {
    let active = true;
    loadRecipesByIngredient(ingredientId, null).then((res) => {
      if (!active) return;
      setRecipes(res.recipes);
      setCursor(res.nextCursor);
      setLoading(false);
      loadingRef.current = false;
    });
    return () => {
      active = false;
    };
  }, [ingredientId]);

  // Infinite scroll for further pages.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || cursor === null) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      loadRecipesByIngredient(ingredientId, cursor).then((res) => {
        setRecipes((prev) => [...prev, ...res.recipes]);
        setCursor(res.nextCursor);
        loadingRef.current = false;
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, ingredientId]);

  if (loading) {
    return (
      <div className="py-1">
        <RecipeGridSkeleton count={2} />
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        {t("noRecipeWith")}
      </p>
    );
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <ul className="grid gap-3">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <RecipeCard
              recipe={recipe}
              href={`/recipes/${recipe.id}`}
              bookmark={
                canSave ? (
                  <SaveToggle recipeId={recipe.id} saved={recipe.saved} />
                ) : undefined
              }
            />
          </li>
        ))}
      </ul>
      {cursor !== null && <div ref={sentinelRef} className="h-8" aria-hidden />}
    </div>
  );
}
