'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { FieldInput } from '@/components/FieldInput';
import {
  SCHEMAS,
  VISIT_TYPE_LABEL,
  type VisitType,
  type Counselor,
  type Client,
  type FieldDef,
  type FormSchema,
} from '@/lib/types';
import { Search, Save, ArrowRight } from 'lucide-react';

interface VisitFormProps {
  type: VisitType;
  client?: Client | null;
  existingData?: Record<string, unknown>;
  existingVisit?: {
    id: string;
    governorate?: string | null;
    governorate_mfl?: string | null;
    district?: string | null;
    district_mfl?: string | null;
    health_facility?: string | null;
    health_facility_mfl?: string | null;
    counselor_name?: string | null;
    counselor_phone?: string | null;
    first_visit_date?: string | null;
    case_number?: string | null;
    session_number?: string | null;
    visit_date?: string | null;
    notes?: string | null;
  };
  counselors: Counselor[];
  isEdit?: boolean;
  prefillFromClient?: boolean;
}

const COMMON_FIELDS: FieldDef[] = [
  { key: 'governorate',         label: 'المحافظة',          type: 'text' },
  { key: 'governorate_mfl',     label: 'كود المحافظة MFL',  type: 'text' },
  { key: 'district',            label: 'المنطقة / الإدارة', type: 'text' },
  { key: 'district_mfl',        label: 'كود الإدارة MFL',   type: 'text' },
  { key: 'health_facility',     label: 'المنشأة الصحية',    type: 'text' },
  { key: 'health_facility_mfl', label: 'كود المنشأة MFS',   type: 'text' },
  { key: 'counselor_name',      label: 'مقدمة المشورة',     type: 'text' },
  { key: 'counselor_phone',     label: 'رقم الموبايل',      type: 'phone' },
  { key: 'first_visit_date',    label: 'تاريخ أول لقاء',    type: 'date' },
  { key: 'case_number',         label: 'رقم الحالة',        type: 'text' },
];

const NATIONAL_ID_FIELDS: Record<VisitType, string> = {
  pre_marriage: 'partner_national_id',     // for search; primary key is partner
  children: 'mother_national_id',
  pregnancy: 'client_national_id',
  family_planning: 'client_national_id',
};

const NAME_FIELDS: Record<VisitType, string> = {
  pre_marriage: 'partner_name',
  children: 'mother_name',
  pregnancy: 'client_name',
  family_planning: 'client_name',
};

const PHONE_FIELDS: Record<VisitType, string> = {
  pre_marriage: 'partner_phone',
  children: 'mother_phone',
  pregnancy: 'client_phone',
  family_planning: 'client_phone',
};

export function VisitForm({
  type,
  client,
  existingData = {},
  existingVisit,
  counselors,
  isEdit = false,
  prefillFromClient = true,
}: VisitFormProps) {
  const router = useRouter();
  const schema = SCHEMAS[type];
  const [data, setData] = useState<Record<string, unknown>>({ ...existingData });
  const [header, setHeader] = useState({
    governorate: existingVisit?.governorate ?? '',
    governorate_mfl: existingVisit?.governorate_mfl ?? '',
    district: existingVisit?.district ?? '',
    district_mfl: existingVisit?.district_mfl ?? '',
    health_facility: existingVisit?.health_facility ?? '',
    health_facility_mfl: existingVisit?.health_facility_mfl ?? '',
    counselor_name: existingVisit?.counselor_name ?? '',
    counselor_phone: existingVisit?.counselor_phone ?? '',
    first_visit_date: existingVisit?.first_visit_date ?? '',
    case_number: existingVisit?.case_number ?? '',
    session_number: existingVisit?.session_number ?? '',
    visit_date: existingVisit?.visit_date ?? new Date().toISOString().slice(0, 10),
    notes: existingVisit?.notes ?? '',
  });
  const [counselorId, setCounselorId] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // If we have an existing client, prefill their info into data
  useEffect(() => {
    if (prefillFromClient && client) {
      setData((prev) => ({
        ...prev,
        [NAME_FIELDS[type]]: client.full_name,
        [NATIONAL_ID_FIELDS[type]]: client.national_id,
        [PHONE_FIELDS[type]]: client.phone ?? '',
        ...client.meta,
      }));
    }
  }, [client, prefillFromClient, type]);

  // Auto-fill counselor when only one is logged in
  useEffect(() => {
    if (counselors.length === 1 && !counselorId) {
      setCounselorId(counselors[0].id);
    }
  }, [counselors, counselorId]);

  // When counselor is picked, also copy name/phone into header
  useEffect(() => {
    if (counselorId) {
      const c = counselors.find((x) => x.id === counselorId);
      if (c) {
        setHeader((h) => ({
          ...h,
          counselor_name: c.full_name,
          counselor_phone: c.phone ?? h.counselor_phone,
        }));
      }
    }
  }, [counselorId, counselors]);

  const sections = useMemo(() => schema.sections, [schema]);

  function setField(key: string, v: unknown) {
    setData((prev) => ({ ...prev, [key]: v }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createClient();

      // Validate
      const idField = NATIONAL_ID_FIELDS[type];
      const nameField = NAME_FIELDS[type];
      const nationalId = (data[idField] as string) ?? '';
      const fullName = (data[nameField] as string) ?? '';
      if (!nationalId || nationalId.length !== 14) {
        throw new Error('الرقم القومي يجب أن يكون 14 رقم');
      }
      if (!fullName) {
        throw new Error('الاسم مطلوب');
      }

      // Upsert client
      const clientMeta: Record<string, unknown> = { ...data };
      // Strip primary identifying fields from meta — they are kept on the client row
      [idField, nameField, PHONE_FIELDS[type]].forEach((k) => delete clientMeta[k]);

      const clientPayload: any = {
        client_type: type,
        national_id: nationalId,
        full_name: fullName,
        phone: (data[PHONE_FIELDS[type]] as string) ?? null,
        meta: clientMeta,
      };

      // Add spouse info for pre-marriage
      if (type === 'pre_marriage') {
        clientPayload.spouse_name = (data.spouse_name as string) ?? null;
        clientPayload.spouse_national_id = (data.spouse_national_id as string) ?? null;
        clientPayload.spouse_phone = (data.spouse_phone as string) ?? null;
      }

      // Try to find existing client first
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('client_type', type)
        .eq('national_id', nationalId)
        .maybeSingle();

      let clientId: string;
      if (existingClient) {
        clientId = existingClient.id;
        await supabase
          .from('clients')
          .update({
            full_name: fullName,
            phone: clientPayload.phone,
            spouse_name: clientPayload.spouse_name,
            spouse_national_id: clientPayload.spouse_national_id,
            spouse_phone: clientPayload.spouse_phone,
            meta: clientMeta,
          })
          .eq('id', clientId);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('clients')
          .insert(clientPayload)
          .select('id')
          .single();
        if (insErr) throw insErr;
        clientId = inserted.id;
      }

      const visitPayload = {
        visit_type: type,
        client_id: clientId,
        counselor_id: counselorId || null,
        governorate: header.governorate || null,
        governorate_mfl: header.governorate_mfl || null,
        district: header.district || null,
        district_mfl: header.district_mfl || null,
        health_facility: header.health_facility || null,
        health_facility_mfl: header.health_facility_mfl || null,
        counselor_name: header.counselor_name || null,
        counselor_phone: header.counselor_phone || null,
        first_visit_date: header.first_visit_date || null,
        case_number: header.case_number || null,
        session_number: header.session_number || null,
        visit_date: header.visit_date || null,
        notes: header.notes || null,
        data,
      };

      if (isEdit && existingVisit) {
        const { error: updErr } = await supabase
          .from('visits')
          .update(visitPayload)
          .eq('id', existingVisit.id);
        if (updErr) throw updErr;
        setSuccess('تم حفظ التعديلات بنجاح');
        setTimeout(() => router.push(`/visits/${existingVisit.id}`), 800);
      } else {
        const { data: newVisit, error: insErr } = await supabase
          .from('visits')
          .insert(visitPayload)
          .select('id')
          .single();
        if (insErr) throw insErr;
        setSuccess('تم حفظ الزيارة بنجاح');
        setTimeout(() => router.push(`/visits/${newVisit.id}`), 800);
      }
    } catch (err: any) {
      setError(err.message ?? 'فشل الحفظ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-800">
            {schema.title}
          </h2>
          {client && (
            <div className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
              ✓ تم العثور على عميل سابق — تم تعبئة بياناته الأساسية تلقائياً
            </div>
          )}
        </div>

        {/* Counselors picker */}
        {counselors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                المدخل
              </label>
              <select
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                value={counselorId}
                onChange={(e) => setCounselorId(e.target.value)}
              >
                <option value="">— اختر المدخل —</option>
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name} {c.employee_code ? `(${c.employee_code})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                تاريخ الزيارة
              </label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
                value={header.visit_date}
                onChange={(e) => setHeader({ ...header, visit_date: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Common fields */}
        <details className="text-sm">
          <summary className="cursor-pointer text-primary-600 hover:underline">
            بيانات المنشأة / الموقع (انقر للتوسيع)
          </summary>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {COMMON_FIELDS.map((f) => (
              <FieldInput
                key={f.key}
                field={f}
                value={(header as any)[f.key]}
                onChange={(v) => setHeader({ ...header, [f.key]: v })}
              />
            ))}
          </div>
        </details>
      </div>

      {/* Schema sections */}
      {sections.map((section) => {
        const fields = schema.fields.filter((f) => f.section === section.id);
        if (fields.length === 0) return null;
        return (
          <div key={section.id} className="bg-white border rounded-lg p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {fields.map((f) => (
                <FieldInput
                  key={f.key}
                  field={f}
                  value={data[f.key]}
                  onChange={(v) => setField(f.key, v)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Notes */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">
          ملاحظات / توصيات عامة
        </h3>
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          value={header.notes}
          onChange={(e) => setHeader({ ...header, notes: e.target.value })}
        />
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-md text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-md text-sm">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 sticky bottom-0 bg-white border-t p-3 -mx-4 md:-mx-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-md flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'جارٍ الحفظ...' : isEdit ? 'حفظ التعديلات' : 'حفظ الزيارة'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-slate-600 hover:underline flex items-center gap-1"
        >
          <ArrowRight size={16} />
          إلغاء
        </button>
      </div>
    </div>
  );
}