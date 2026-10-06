import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { isSupabaseConfigured } from '@/lib/mock-db';
import { createMockClient } from '@/lib/mock-client';

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isSupabaseConfigured() && url && key) {
    let cookieStore: any = null;
    try {
      cookieStore = cookies();
    } catch {
      // RSC context without cookies
    }

    return createServerClient(url, key, {
      cookies: {
        getAll() {
          return cookieStore?.getAll?.() || [];
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore?.set?.(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies. Ignore when called from RSC.
          }
        },
      },
    });
  }

  // Fallback in-memory server mock client
  return createMockClient();
}
