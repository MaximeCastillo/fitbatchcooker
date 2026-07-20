import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Refreshes the Supabase session on every request and writes any refreshed auth
// cookies back onto the response. Call this from the root middleware.ts.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // Make refreshed cookies available to the rest of this request…
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          // …and send them back on the response.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          // Mandatory: stop CDNs/proxies from caching a response that sets auth
          // cookies — otherwise one user's session token could leak to another.
          Object.entries(headers).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Use getUser() (revalidates the JWT with Supabase), not getSession(). Must run
  // before returning so a token refresh is applied to the response cookies.
  await supabase.auth.getUser();

  return response;
}
