import { getLocale, getTranslations } from "next-intl/server";
import { ChevronLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Link, redirect } from "@/i18n/navigation";
import { RecipeForm } from "@/components/recipe-form";

// Auth-guarded: the form persists a recipe owned by the current user.
export const dynamic = "force-dynamic";

export default async function NewRecipePage() {
  const t = await getTranslations("recipes");
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  // The whole shared ingredient catalog — small enough to ship to the client picker.
  const catalog = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, category: true, picto: true },
  });

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      {/* Way out without the browser Back button — the form is a dead end otherwise. */}
      <Link
        href="/recipes"
        className="mb-6 inline-flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        {t("detail.back")}
      </Link>

      <h1 className="mb-6 text-3xl font-bold tracking-tight">{t("new")}</h1>
      <RecipeForm catalog={catalog} />
    </main>
  );
}
