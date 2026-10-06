import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
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
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-lg space-y-3 max-w-xl">
        <h2 className="text-lg font-bold text-amber-800">صلاحيات غير كافية</h2>
        <p className="text-sm">
          تعديل بيانات المدخلين متاح فقط لمدير النظام.
        </p>
        <Link
          href="/counselors"
          className="inline-block text-sm text-primary-700 hover:underline font-medium"
        >
          ← العودة لقائمة المدخلين
        </Link>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">تعديل بيانات المدخل</h1>
          <p className="text-sm text-slate-500 mt-1">
            تحديث البيانات الشخصية، الوظيفية، والتخصص للمدخل: {(data as Counselor).full_name}
          </p>
        </div>
        <Link
          href="/counselors"
          className="text-sm text-slate-600 hover:underline"
        >
          رجوع للقائمة
        </Link>
      </div>
      <CounselorForm mode="edit" initial={data as Counselor} />
    </div>
  );
}
