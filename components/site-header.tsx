import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";
import { strings } from "@/lib/strings";

// Server Component: reads the current user on the server and shows auth state.
export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <Link href="/" className="font-semibold">
        {APP_NAME}
      </Link>
      <nav className="flex items-center gap-3 text-sm">
        <Link
          href="/recipes"
          className="text-muted-foreground hover:text-foreground"
        >
          {strings.nav.recipes}
        </Link>
        {user ? (
          <>
            <span className="text-muted-foreground">{user.email}</span>
            <form action={logout}>
              <Button type="submit" variant="outline" size="sm">
                {strings.nav.logout}
              </Button>
            </form>
          </>
        ) : (
          <Button render={<Link href="/login" />} size="sm" nativeButton={false}>
            {strings.nav.login}
          </Button>
        )}
      </nav>
    </header>
  );
}
