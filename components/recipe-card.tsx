import { useTranslations } from "next-intl";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

// Shared recipe card: title, summary, macro badges, and an optional bookmark action
// pinned top-right (the save/remove toggle). The card stays agnostic of the action —
// the caller passes whatever bookmark node it needs.
//
// When `href` is set, the whole card becomes a link to the detail page via the
// "stretched link" pattern: the title is the only real <a>, and its ::after covers
// the whole (relative) card — so the entire card is tappable without nesting an
// anchor around the bookmark button (which stays clickable thanks to z-10).
type RecipeCardProps = {
  recipe: {
    title: string;
    summary: string | null;
    servings: number;
    proteinPerServingG: number | null;
    caloriesPerServingKcal: number | null;
  };
  href?: string;
  bookmark?: React.ReactNode;
};

export function RecipeCard({ recipe, href, bookmark }: RecipeCardProps) {
  const t = useTranslations("recipes");
  return (
    <Card
      className={cn(
        "relative flex h-full flex-col",
        href && "transition-shadow hover:shadow-md",
      )}
    >
      {bookmark && (
        <div className="absolute right-2 top-2 z-10">{bookmark}</div>
      )}
      <CardHeader className={cn(bookmark && "pr-14")}>
        <CardTitle>
          {href ? (
            <Link
              href={href}
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
        {recipe.proteinPerServingG != null && (
          <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
            {t("protein", { grams: recipe.proteinPerServingG })}
          </span>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {t("servings", { count: recipe.servings })}
        </span>
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {t("calories", { kcal: recipe.caloriesPerServingKcal })}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
