import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { CounselorForm } from '../form-client';

export default async function NewCounselorPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  if (!session.isAdmin) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-900 p-6 rounded-lg space-y-3 max-w-xl">
        <h2 className="text-lg font-bold text-amber-800">صلاحيات غير كافية</h2>
        <p className="text-sm">
          إضافة مدخل جديد متاحة فقط لمدير النظام. يمكنك تصفح قائمة المدخلين الحالية.
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">إضافة مدخل جديد</h1>
          <p className="text-sm text-slate-500 mt-1">
            تسجيل بيانات مقدم مشورة جديد في النظام وربطه بمهام الإدخال
          </p>
        </div>
        <Link
          href="/counselors"
          className="text-sm text-slate-600 hover:underline"
        >
          رجوع للقائمة
        </Link>
      </div>
      <CounselorForm mode="create" />
    </div>
  );
}
