import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

// Composed middleware: next-intl handles locale routing (prefixes, detection, the
// alternate-language `Link` header for SEO), and Supabase refreshes the auth session.
// We run next-intl FIRST to get the response, then hand that same response to Supabase
// so its refreshed Set-Cookie headers land on it — neither step discards the other.
const handleI18nRouting = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  // API routes still get their session refreshed, but no locale routing applies to them.
  const isApiRoute = request.nextUrl.pathname.startsWith("/api");
  const response = isApiRoute
    ? NextResponse.next({ request })
    : handleI18nRouting(request);

  return updateSession(request, response);
}

export const config = {
  matcher: [
    // Run on everything except Next internals and static asset files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
