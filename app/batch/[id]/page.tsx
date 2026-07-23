import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ChevronLeft, Trash2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { renameBatch, deleteBatch } from "../actions";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

export const dynamic = "force-dynamic";

// A single batch. Composer skeleton for now (name + days); drag-and-drop composition
// lands in the next phase. Scoped: only the owner can open it (spec §7).
export default async function BatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const plan = await prisma.mealPlan.findFirst({
    where: { id, userId: user.id },
  });
  if (!plan) notFound();

  // Inline Server Action: rename this batch (planId captured in the closure).
  async function rename(formData: FormData) {
    "use server";
    await renameBatch(id, String(formData.get("name") ?? ""));
  }

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      <Link
        href="/batch"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        {strings.batch.title}
      </Link>

      <div className="mb-6 flex items-end justify-between gap-4">
        <form action={rename} className="flex items-center gap-2">
          <input
            name="name"
            defaultValue={plan.name ?? ""}
            aria-label={strings.batch.nameLabel}
            className="min-w-0 border-b-2 border-transparent bg-transparent font-display text-3xl font-bold tracking-wide uppercase outline-none hover:border-border focus:border-primary"
          />
          <Button type="submit" variant="outline" size="sm">
            OK
          </Button>
        </form>
        <form action={deleteBatch.bind(null, plan.id)}>
          <Button type="submit" variant="outline" size="sm">
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: plan.dayCount }).map((_, index) => (
          <div
            key={index}
            className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground"
          >
            <span className="font-display text-lg font-bold tracking-wide uppercase text-foreground">
              Jour {index + 1}
            </span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        {strings.batch.composerSoon}
      </p>
    </main>
  );
}
