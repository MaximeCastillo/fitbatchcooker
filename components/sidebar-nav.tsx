"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Boxes, UtensilsCrossed, BookMarked, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { strings } from "@/lib/strings";

const items = [
  { href: "/batch", label: strings.nav.batch, icon: Boxes },
  { href: "/recipes", label: strings.nav.recipes, icon: UtensilsCrossed },
  { href: "/book", label: strings.nav.book, icon: BookMarked },
  { href: "/chat", label: strings.nav.chat, icon: MessageCircle },
];

// Client Component so it can highlight the active route via usePathname.
export function SidebarNav({
  orientation = "vertical",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex gap-1",
        orientation === "vertical" ? "flex-col" : "flex-row",
      )}
    >
      {items.map(({ href, label, icon: Icon }) => {
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
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
