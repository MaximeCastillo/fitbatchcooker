"use client";

import type { ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Wrapper for the intercepting recipe modal (opened when a card is tapped from the
// /recipes list). Closing returns to the list — which stays mounted underneath, so the
// filters + scroll position are preserved ("pour pas perdre le fil"). A plain <a> opens
// the standalone full page (a real navigation, not intercepted).
export function RecipeModal({
  title,
  fullHref,
  bookmark,
  children,
}: {
  title: string;
  fullHref: string;
  bookmark?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const t = useTranslations("recipes");

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <DialogTitle>{title}</DialogTitle>
            {bookmark}
          </div>
        </DialogHeader>

        <div className="max-h-[70vh] overflow-y-auto">{children}</div>

        <a
          href={fullHref}
          className="mt-1 inline-flex items-center gap-1 self-start text-sm font-medium text-primary hover:underline"
        >
          {t("detail.openFull")}
          <ArrowUpRight className="size-4" aria-hidden />
        </a>
      </DialogContent>
    </Dialog>
  );
}
