import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request: { headers: request.headers } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, just let the request through — the server
  // components will throw a clearer error if Supabase is actually needed.
  if (!url || !key) {
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // IMPORTANT: do not run any other code that uses cookies after this point,
    // because this will re-create the NextResponse and lose them.

    // Use getSession() — it's lighter than getUser() and won't try to refresh
    // tokens.  A refreshed session is more reliable in server components.
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Public routes — login + auth callback.  Everything else requires login.
    const publicPaths = ['/login', '/auth', '/api/template'];
    const isPublic = publicPaths.some((p) => request.nextUrl.pathname.startsWith(p));

    if (!user && !isPublic) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (err) {
    // If anything in the middleware throws, log and let the request through
    // (server components will handle the auth check).  This avoids
    // MIDDLEWARE_INVOCATION_FAILED breaking the whole site.
    console.error('[middleware] error:', err);
    return response;
  }
}