import { useTranslations } from "next-intl";
import { UtensilsCrossed } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { MealType } from "@/lib/generated/prisma/enums";

// Shared recipe card: image, title, summary, mealType + macro badges, and an optional
// bookmark action pinned top-right. A recipe is one part (no servings badge). Images
// are shown when present; a placeholder fills the slot otherwise (upload lands later).
//
// When `href` is set, the whole card becomes a link via the "stretched link" pattern:
// the title is the only real <a>, its ::after covers the whole (relative) card — so the
// card is tappable without nesting an anchor around the bookmark (kept clickable by z-10).
//
// `onOpen` intercepts the plain left-click to open a preview modal instead of navigating.
// The anchor stays a real link on purpose: Cmd/Ctrl-click, middle-click and "open in new
// tab" keep working, and the card is still a link for crawlers and keyboard users.
type RecipeCardProps = {
  recipe: {
    title: string;
    summary: string | null;
    mealType?: MealType;
    proteinPerServingG: number | null;
    caloriesPerServingKcal: number | null;
    imageUrl?: string | null;
  };
  href?: string;
  bookmark?: React.ReactNode;
  onOpen?: (source: HTMLElement) => void;
};

export function RecipeCard({ recipe, href, bookmark, onOpen }: RecipeCardProps) {
  const t = useTranslations("recipes");
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col overflow-hidden",
        href && "transition-shadow hover:shadow-md",
      )}
    >
      {bookmark && (
        <div className="absolute right-2 top-2 z-10">{bookmark}</div>
      )}
      {/* Illustration slot — placeholder until image upload lands (Phase C). */}
      <div className="flex aspect-[16/9] w-full items-center justify-center bg-muted">
        <UtensilsCrossed
          className="size-8 text-muted-foreground/40"
          aria-hidden
        />
      </div>
      <CardHeader className="pr-4">
        <CardTitle>
          {href ? (
            <Link
              href={href}
              onClick={(event) => {
                if (!onOpen) return;
                // Let modified / non-primary clicks fall through to a real navigation.
                if (
                  event.metaKey ||
                  event.ctrlKey ||
                  event.shiftKey ||
                  event.altKey ||
                  event.button !== 0
                ) {
                  return;
                }
                event.preventDefault();
                onOpen(event.currentTarget);
              }}
              className="transition-colors after:absolute after:inset-0 hover:text-primary"
            >
              {recipe.title}
            </Link>
          ) : (
            recipe.title
          )}
        </CardTitle>
        {recipe.summary && <CardDescription>{recipe.summary}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2 text-sm">
        {recipe.mealType && (
          <span className="rounded-full bg-accent px-3 py-1 font-medium text-accent-foreground">
            {t(`mealType.${recipe.mealType}`)}
          </span>
        )}
        {recipe.proteinPerServingG != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {t("protein", { grams: recipe.proteinPerServingG })}
          </span>
        )}
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {t("calories", { kcal: recipe.caloriesPerServingKcal })}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
