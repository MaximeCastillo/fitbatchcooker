"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Loader2 } from "lucide-react";
import {
  loadRecipeDetail,
  type RecipeDetailPayload,
} from "@/app/[locale]/recipes/actions";
import { RecipeDetail } from "@/components/recipe-detail";
import { SaveToggle } from "@/components/save-toggle";
import { Link } from "@/i18n/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type PreviewedRecipe = {
  id: string;
  title: string;
  saved: boolean;
  /** Offset of the tapped card from the viewport centre, so the panel flies out of it. */
  origin: { dx: number; dy: number };
};

// Read-only recipe preview over the /recipes list — the list stays mounted underneath, so
// filters and scroll survive ("pour pas perdre le fil"). A plain state-driven Radix Dialog:
// the previous version used a parallel/intercepting route, which 500'd under the [locale]
// segment. The "full page" link hands the current filters over via ?from= so the detail
// page can offer a back link that restores them.
// `recipe` is kept (not nulled) while closing so the panel still has content during the
// exit animation — hence the separate `open` flag.
export function RecipePreviewModal({
  recipe,
  open,
  canSave,
  filterQuery,
  onClose,
  onSavedChange,
}: {
  recipe: PreviewedRecipe | null;
  open: boolean;
  canSave: boolean;
  filterQuery: string;
  onClose: () => void;
  onSavedChange: (recipeId: string, saved: boolean) => void;
}) {
  const t = useTranslations("recipes");

  const fullHref = recipe
    ? filterQuery
      ? `/recipes/${recipe.id}?from=${encodeURIComponent(filterQuery)}`
      : `/recipes/${recipe.id}`
    : "/recipes";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-2xl"
        style={
          {
            "--dx": `${recipe?.origin.dx ?? 0}px`,
            "--dy": `${recipe?.origin.dy ?? 0}px`,
          } as React.CSSProperties
        }
      >
        {recipe && (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-3">
                <DialogTitle>{recipe.title}</DialogTitle>
                {canSave && (
                  // Keyed by recipe: SaveToggle seeds its state from the prop once, so a
                  // fresh instance per recipe keeps the bookmark in sync with the list.
                  <SaveToggle
                    key={recipe.id}
                    recipeId={recipe.id}
                    saved={recipe.saved}
                    onToggle={(saved) => onSavedChange(recipe.id, saved)}
                  />
                )}
              </div>
            </DialogHeader>

            <PreviewBody key={recipe.id} recipeId={recipe.id} />

            {/* `replace`: the open modal owns a throwaway history entry, so the detail
                page takes its place instead of stacking on top. Back then lands straight
                back on the list rather than on a dead duplicate entry. */}
            <Link
              href={fullHref}
              replace
              className="inline-flex min-h-11 items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
            >
              {t("detail.openFull")}
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// The detail (steps, ingredients, macros) isn't in the card payload, so it's fetched when
// the modal opens. Remounted per recipe via `key` → no stale content flashing.
function PreviewBody({ recipeId }: { recipeId: string }) {
  const t = useTranslations("recipes");
  const [data, setData] = useState<RecipeDetailPayload>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    loadRecipeDetail(recipeId).then((result) => {
      if (!active) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [recipeId]);

  if (loading) {
    return (
      <div className="grid place-items-center py-10" role="status" aria-live="polite">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-hidden />
      </div>
    );
  }

  if (!data) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">{t("empty")}</p>
    );
  }

  return <RecipeDetail recipe={data.detail} />;
}
