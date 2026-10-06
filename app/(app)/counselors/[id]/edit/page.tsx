import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { CounselorForm } from '../../form-client';
import type { Counselor } from '@/lib/types';

export default async function EditCounselorPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');
  if (!session.isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md">
        هذه الصفحة متاحة فقط لمدير النظام
      </div>
    );
  }

  const supabase = createClient();
  const { data, error } = await supabase
    .from('counselors')
    .select('*')
    .eq('id', params.id)
    .maybeSingle();
  if (error || !data) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">تعديل بيانات المدخل</h1>
      <CounselorForm mode="edit" initial={data as Counselor} />
    </div>
  );
}