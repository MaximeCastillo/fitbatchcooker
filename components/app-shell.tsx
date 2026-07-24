import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { SidebarNav } from "@/components/sidebar-nav";
import { AuthTopbarAction } from "@/components/auth-topbar-action";
import { APP_NAME } from "@/lib/constants";
import { strings } from "@/lib/strings";

// Brand lockup — the mark echoes the signature protein gauge (a container filled with
// protein), not initials. Full wordmark, never abbreviated.
function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="relative grid size-9 shrink-0 overflow-hidden rounded-xl border-2 border-primary bg-primary/10">
        <span className="absolute inset-x-0 bottom-0 h-[58%] bg-primary" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold tracking-wide whitespace-nowrap uppercase">
        {APP_NAME}
      </span>
    </Link>
  );
}

// App chrome. Logged-out users get a slim top bar (clean login/marketing pages);
// logged-in users get the sidebar (desktop) + a compact top bar (mobile).
export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col">
        <header className="flex items-center justify-between border-b px-6 py-3">
          <BrandMark />
          <AuthTopbarAction />
        </header>
        {children}
      </div>
    );
  }

  const initial = (user.firstName ?? user.email).charAt(0).toUpperCase();

  return (
    <div className="flex min-h-dvh">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col gap-2 border-r bg-sidebar p-4 md:flex">
        <div className="px-2 pb-4">
          <BrandMark />
        </div>
        <SidebarNav />
        {/* The whole chip is the link to the account page, not just the name. */}
        <Link
          href="/account"
          className="mt-auto flex items-center gap-3 rounded-xl border p-3 transition-colors hover:border-primary hover:bg-accent"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent-warm font-bold text-white">
            {initial}
          </span>
          <div className="min-w-0 text-sm leading-tight">
            <span className="block truncate font-semibold">
              {user.firstName ?? user.email}
            </span>
            {user.proteinTargetG ? (
              <span className="text-muted-foreground">
                {user.proteinTargetG} g / jour
              </span>
            ) : null}
          </div>
        </Link>
      </aside>

      {/* Content column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden">
          <header className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
            <BrandMark />
            {/* Account is reached by tapping the avatar (mirrors the desktop chip). */}
            <Link
              href="/account"
              aria-label={strings.nav.account}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-warm font-bold text-white"
            >
              {initial}
            </Link>
          </header>
          <div className="border-b px-2 py-1.5">
            <SidebarNav orientation="horizontal" />
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
