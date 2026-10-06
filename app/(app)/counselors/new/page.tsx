import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { CounselorForm } from '../form-client';

export default async function NewCounselorPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  if (!session.isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        هذه الصفحة متاحة فقط لمدير النظام
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">إضافة مدخل جديد</h1>
      <CounselorForm mode="create" />
    </div>
  );
}