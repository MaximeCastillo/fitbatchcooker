import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { strings } from "@/lib/strings";

// Shared recipe card: the common base (title, summary, macro badges). Any action
// button(s) are passed as children (the footer slot) — save/remove today, whatever
// we need later. The card stays agnostic of the action.
type RecipeCardProps = {
  recipe: {
    title: string;
    summary: string | null;
    servings: number;
    proteinPerServingG: number | null;
    caloriesPerServingKcal: number | null;
  };
  children?: React.ReactNode;
};

export function RecipeCard({ recipe, children }: RecipeCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{recipe.title}</CardTitle>
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
      {children && <CardFooter className="mt-auto">{children}</CardFooter>}
    </Card>
  );
}
