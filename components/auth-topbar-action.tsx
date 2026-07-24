"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link, usePathname } from "@/i18n/navigation";

// Top-right auth entry point for logged-out visitors — the classic "returning user"
// affordance. Hidden on the auth page itself, where it would be redundant.
export function AuthTopbarAction() {
  const pathname = usePathname();
  const t = useTranslations("nav");
  if (pathname.startsWith("/login")) return null;

  return (
    <Button render={<Link href="/login" />} size="sm" nativeButton={false}>
      {t("login")}
    </Button>
  );
}
