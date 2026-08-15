"use client";

import {
  Boxes,
  UtensilsCrossed,
  MessageCircle,
  Drumstick,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Link, usePathname } from "@/i18n/navigation";

// Nav destinations. Hrefs are locale-agnostic (the locale-aware Link adds the prefix);
// labels are resolved from the `nav` message namespace at render time.
const items = [
  { href: "/batch", key: "batch", icon: Boxes },
  { href: "/chat", key: "chat", icon: MessageCircle },
  { href: "/recipes", key: "recipes", icon: UtensilsCrossed },
  { href: "/ingredients", key: "ingredients", icon: Drumstick },
] as const;

// Three "typing" dots inside the chat bubble. They are invisible at rest and only
// revealed by the hover animation (see the nav icon rules in app/globals.css).
// Coordinates match lucide's own MessageCircleMore so they sit where the icon
// family expects them.
const typingDots = [8, 12, 16].map((cx) => (
  <circle
    key={cx}
    className="nav-typing-dot"
    cx={cx}
    cy="12"
    r="1.1"
    fill="currentColor"
    stroke="none"
  />
));

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
            // Anchor for the guided tour. Both navs (desktop sidebar + mobile strip) carry
            // it; the tour picks whichever one is actually visible.
            data-tour={`nav-${key}`}
            className={cn(
              // `nav-link` is the hover hook for the icon animations in globals.css.
              "nav-link flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-5 shrink-0" data-nav-icon={key} aria-hidden>
              {key === "chat" ? typingDots : null}
            </Icon>
            <span className={orientation === "horizontal" ? "hidden sm:inline" : ""}>
              {t(key)}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
