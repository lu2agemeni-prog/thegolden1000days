import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { listCounselors } from '@/lib/queries';
import { CounselorsListClient } from './list-client';

export default async function CounselorsPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  if (!session.isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        هذه الصفحة متاحة فقط لمدير النظام
      </div>
    );
  }

  const counselors = await listCounselors(true);
  return <CounselorsListClient counselors={counselors} />;
}