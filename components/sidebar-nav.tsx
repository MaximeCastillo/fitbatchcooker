"use client";

import {
  Boxes,
  UtensilsCrossed,
  BookMarked,
  MessageCircle,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

// Nav destinations. Hrefs are locale-agnostic (the locale-aware Link adds the prefix);
// labels are resolved from the `nav` message namespace at render time.
const items = [
  { href: "/batch", key: "batch", icon: Boxes },
  { href: "/book", key: "book", icon: BookMarked },
  { href: "/chat", key: "chat", icon: MessageCircle },
  { href: "/recipes", key: "recipes", icon: UtensilsCrossed },
] as const;

// Client Component so it can highlight the active route via usePathname.
export function SidebarNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  // next-intl's usePathname returns the pathname WITHOUT the locale prefix, so these
  // checks stay the same across locales.
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row",
      )}
    >
      {items.map(({ href, key, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" aria-hidden />
            <span className={orientation === "horizontal" ? "hidden sm:inline" : ""}>
              {t(key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
