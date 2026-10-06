import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { getVisit } from '@/lib/queries';
import { SCHEMAS, VISIT_TYPE_LABEL, VISIT_TYPE_SHORT, type VisitType } from '@/lib/types';
import { Pencil, ArrowRight, FileDown, Printer } from 'lucide-react';

export default async function VisitDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const visit = await getVisit(params.id);
  if (!visit) notFound();

  const schema = SCHEMAS[visit.visit_type as VisitType];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white border rounded-lg p-4 shadow-sm no-print">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="text-xs text-slate-500">{VISIT_TYPE_LABEL[visit.visit_type]}</div>
            <h1 className="text-2xl font-bold text-slate-800 mt-1">
              {visit.client?.full_name}
            </h1>
            <div className="text-sm text-slate-600 mt-1" dir="ltr">
              {visit.client?.national_id}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/visits/${visit.id}/edit`}
              className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
            >
              <Pencil size={14} />
              تعديل
            </Link>
            <a
              href={`/api/export/visit/${visit.id}`}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
            >
              <FileDown size={14} />
              تصدير Excel
            </a>
            <button
              onClick={() => undefined}
              className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
              formAction="javascript:window.print()"
            >
              <Printer size={14} />
              طباعة
            </button>
            <Link
              href="/visits"
              className="text-slate-500 hover:underline text-sm flex items-center gap-1"
            >
              <ArrowRight size={14} />
              رجوع
            </Link>
          </div>
        </div>
      </div>

      {/* Common fields */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">
          بيانات المنشأة والزيارة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <Field label="المحافظة" v={visit.governorate} />
          <Field label="كود المحافظة MFL" v={visit.governorate_mfl} />
          <Field label="المنطقة / الإدارة" v={visit.district} />
          <Field label="كود الإدارة MFL" v={visit.district_mfl} />
          <Field label="المنشأة الصحية" v={visit.health_facility} />
          <Field label="كود المنشأة MFS" v={visit.health_facility_mfl} />
          <Field label="مقدمة المشورة" v={visit.counselor_name} />
          <Field label="رقم الموبايل" v={visit.counselor_phone} />
          <Field label="تاريخ أول لقاء" v={visit.first_visit_date} />
          <Field label="رقم الحالة" v={visit.case_number} />
          <Field label="رقم اللقاء" v={visit.session_number} />
          <Field label="تاريخ الزيارة" v={visit.visit_date} />
        </div>
      </div>

      {/* Schema sections */}
      {schema.sections.map((section) => {
        const fields = schema.fields.filter((f) => f.section === section.id);
        if (fields.length === 0) return null;
        return (
          <div key={section.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">
              {section.title}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {fields.map((f) => (
                <Field
                  key={f.key}
                  label={f.label}
                  v={visit.data?.[f.key]}
                />
              ))}
            </div>
          </div>
        );
      })}

      {visit.notes && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-2">ملاحظات / توصيات</h2>
          <p className="text-sm whitespace-pre-wrap">{visit.notes}</p>
        </div>
      )}

      <div className="text-xs text-slate-500 no-print">
        أُنشئت في: {new Date(visit.created_at).toLocaleString('ar-EG')}
        {' • '}
        آخر تعديل: {new Date(visit.updated_at).toLocaleString('ar-EG')}
      </div>
    </div>
  );
}

function Field({ label, v }: { label: string; v: unknown }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-slate-800 mt-0.5">
        {v === null || v === undefined || v === '' ? '—' : String(v)}
      </div>
    </div>
  );
}