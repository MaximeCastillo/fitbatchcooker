"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/strings";

// Top-right auth entry point for logged-out visitors — the classic "returning user"
// affordance. Hidden on the auth page itself, where it would be redundant.
export function AuthTopbarAction() {
  const pathname = usePathname();
  if (pathname.startsWith("/login")) return null;

  return (
    <Button render={<Link href="/login" />} size="sm" nativeButton={false}>
      {strings.nav.login}
    </Button>
  );
}
