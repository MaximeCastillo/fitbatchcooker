import { getLocale, getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { createBatch } from "./actions";
import { BatchList } from "@/components/batch-list";
import { Button } from "@/components/ui/button";
import { redirect } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

// "Mes batchs" — the library of saved batches. Scoped to the current user (spec §7).
export default async function BatchListPage() {
  const user = await getCurrentUser();
  if (!user) return redirect({ href: "/login", locale: await getLocale() });

  const t = await getTranslations("batch");

  const plans = await prisma.batch.findMany({
    where: { userId: user.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { entries: true } } },
  });
  const initialBatches = plans.map((plan) => ({
    id: plan.id,
    name: plan.name,
    dayCount: plan.dayCount,
    entryCount: plan._count.entries,
  }));

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <form action={createBatch}>
          <Button type="submit">
            <Plus className="size-4" aria-hidden />
            {t("new")}
          </Button>
        </form>
      </div>

      <BatchList initialBatches={initialBatches} />
    </main>
  );
}
