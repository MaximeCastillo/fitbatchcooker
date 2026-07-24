import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { strings } from "@/lib/strings";

// Shared recipe card: the common base (title, summary, macro badges). Any action
// button(s) are passed as children (the footer slot) — save/remove today, whatever
// we need later. The card stays agnostic of the action.
//
// When `href` is set, the whole card becomes a link to the detail page via the
// "stretched link" pattern: the title is the only real <a>, and its ::after covers
// the whole (relative) card — so the entire card is tappable without nesting an
// anchor around the footer button (which stays clickable thanks to z-10).
type RecipeCardProps = {
  recipe: {
    title: string;
    summary: string | null;
    servings: number;
    proteinPerServingG: number | null;
    caloriesPerServingKcal: number | null;
  };
  href?: string;
  children?: React.ReactNode;
};

export function RecipeCard({ recipe, href, children }: RecipeCardProps) {
  return (
    <Card
      className={cn(
        "flex h-full flex-col",
        href && "relative transition-shadow hover:shadow-md",
      )}
    >
      <CardHeader>
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
            {strings.recipes.protein(recipe.proteinPerServingG)}
          </span>
        )}
        <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
          {strings.recipes.servings(recipe.servings)}
        </span>
        {recipe.caloriesPerServingKcal != null && (
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">
            {strings.recipes.calories(recipe.caloriesPerServingKcal)}
          </span>
        )}
      </CardContent>
      {children && (
        <CardFooter className="relative z-10 mt-auto">{children}</CardFooter>
      )}
    </Card>
  );
}
