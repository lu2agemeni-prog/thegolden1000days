import { createClient } from '@/lib/supabase/server';
import type { Counselor } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mock-db';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  email: string | null;
  counselor: Counselor | null;
  isAdmin: boolean;
  isCounselor: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  if (!isSupabaseConfigured()) {
    try {
      const cookieStore = cookies();
      const isLoggedOut = cookieStore.get('mock_logged_out')?.value === 'true';
      if (isLoggedOut) return null;
    } catch {
      // In contexts where cookies() is unavailable
    }

    const admin =
      mockDb.getCounselors(true).find((c) => c.is_admin && c.is_active) ||
      mockDb.getCounselors(true)[0];

    return {
      id: admin.user_id || admin.id,
      email: admin.email || 'admin@health.gov.eg',
      counselor: admin,
      isAdmin: true,
      isCounselor: true,
    };
  }

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: counselor } = await supabase
    .from('counselors')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    counselor: counselor ?? null,
    isAdmin: !!counselor?.is_admin && !!counselor?.is_active,
    isCounselor: !!counselor?.is_active,
  };
}

export async function requireSession(): Promise<SessionUser> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('UNAUTHORIZED');
  }
  return session;
}
