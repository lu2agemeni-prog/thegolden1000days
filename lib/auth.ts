import { createClient } from '@/lib/supabase/server';
import type { Counselor } from '@/lib/types';

export interface SessionUser {
  id: string;
  email: string | null;
  counselor: Counselor | null;
  isAdmin: boolean;
  isCounselor: boolean;
}

export async function getSessionUser(): Promise<SessionUser | null> {
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