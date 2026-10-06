import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listCounselors } from '@/lib/queries';
import { CounselorsListClient } from './list-client';

export default async function CounselorsPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const counselors = await listCounselors(true);
  return (
    <CounselorsListClient
      counselors={counselors}
      isAdmin={session.isAdmin}
    />
  );
}
