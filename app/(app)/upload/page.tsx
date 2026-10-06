import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listCounselors } from '@/lib/queries';
import { UploadClient } from './upload-client';

export default async function UploadPage() {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const counselors = await listCounselors();

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">رفع ملف إكسل قديم</h1>
        <p className="text-sm text-slate-500 mt-1">
          ارفع ملف Excel القديم لإضافة الزيارات الموجودة مسبقاً إلى النظام. التطبيق سيتعامل مع كل نوع مشورة من الـ 4 شيتات تلقائياً.
        </p>
      </div>
      <UploadClient counselors={counselors} />
    </div>
  );
}