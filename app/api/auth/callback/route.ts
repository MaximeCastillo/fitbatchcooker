import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Auth callback for password reset (and future email confirmation). Supabase sends the
// user here with a `?code=` param; we exchange it for a session (PKCE) so the browser is
// authenticated, then forward to the page named in `next` (default /reset-password).
//
// Lives under /api so the next-intl proxy treats it as an API route (no locale rewrite).
// We build the client against the redirect RESPONSE — as the session middleware does — so
// the refreshed auth cookies are written onto the very response we return.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/reset-password";

  if (code) {
    const response = NextResponse.redirect(`${origin}${next}`);
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return response;
  }

  // No code, or the exchange failed → land on /reset-password without a session, which
  // renders the "invalid or expired link" state.
  return NextResponse.redirect(`${origin}/reset-password`);
}
