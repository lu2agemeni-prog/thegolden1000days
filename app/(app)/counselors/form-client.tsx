'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, ArrowRight } from 'lucide-react';
import type { Counselor } from '@/lib/types';

const WORK_DAYS = [
  'السبت',
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
];

export function CounselorForm({
  mode,
  initial,
}: {
  mode: 'create' | 'edit';
  initial?: Partial<Counselor>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: initial?.full_name ?? '',
    national_id: initial?.national_id ?? '',
    phone: initial?.phone ?? '',
    email: initial?.email ?? '',
    employee_code: initial?.employee_code ?? '',
    specialty: initial?.specialty ?? '',
    work_days: initial?.work_days ?? '',
    trainings: initial?.trainings ?? '',
    is_admin: initial?.is_admin ?? false,
    is_active: initial?.is_active ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function toggleDay(day: string) {
    const current = form.work_days
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean);
    const has = current.includes(day);
    const next = has ? current.filter((d) => d !== day) : [...current, day];
    set('work_days', next.join('، '));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const url = mode === 'create' ? '/api/counselors' : `/api/counselors/${initial!.id}`;
      const method = mode === 'create' ? 'POST' : 'PATCH';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          national_id: form.national_id || null,
          phone: form.phone || null,
          email: form.email || null,
          employee_code: form.employee_code || null,
        }),
      });
      if (!res.ok) {
        const j = await res.json();
        throw new Error(j.error ?? 'فشل الحفظ');
      }
      setSuccess('تم الحفظ بنجاح');
      setTimeout(() => router.push('/counselors'), 800);
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSave}
      className="bg-white border rounded-lg p-4 shadow-sm space-y-4 max-w-3xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="الاسم (ثلاثي)" required>
          <input
            required
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={form.full_name}
            onChange={(e) => set('full_name', e.target.value)}
          />
        </Field>
        <Field label="كود الموظف">
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={form.employee_code}
            onChange={(e) => set('employee_code', e.target.value)}
            placeholder="EMP-001"
          />
        </Field>
        <Field label="الرقم القومي">
          <input
            type="text"
            inputMode="numeric"
            dir="ltr"
            maxLength={14}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-left"
            value={form.national_id}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '').slice(0, 14);
              set('national_id', d);
            }}
          />
        </Field>
        <Field label="رقم التليفون">
          <input
            type="tel"
            inputMode="numeric"
            dir="ltr"
            maxLength={11}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-left"
            value={form.phone}
            onChange={(e) => {
              const d = e.target.value.replace(/\D/g, '').slice(0, 11);
              set('phone', d);
            }}
            placeholder="01XXXXXXXXX"
          />
        </Field>
        <Field label="البريد الإلكتروني أو اسم المستخدم">
          <input
            type="text"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            placeholder="example@health.gov.eg أو nadaesawynm"
          />
        </Field>
        <Field label="التخصص">
          <input
            type="text"
            list="specialty-suggestions"
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            value={form.specialty}
            onChange={(e) => set('specialty', e.target.value)}
            placeholder="طبيب أسنان / طبيب بشري / أخصائي تمريض / رائدة..."
          />
          <datalist id="specialty-suggestions">
            <option value="طبيب أسنان" />
            <option value="طبيبة بشرية - استشاري طب أسرة" />
            <option value="أخصائية نساء وتوليد" />
            <option value="أخصائية تمريض ومشورة رضاعة" />
            <option value="رائدة ريفية صحية" />
            <option value="طبيب أطفال" />
            <option value="أخصائي تغذية علاجية" />
            <option value="أخصائي نفسي / اجتماعي" />
          </datalist>
        </Field>
      </div>

      <Field label="أيام العمل">
        <div className="flex flex-wrap gap-2">
          {WORK_DAYS.map((d) => {
            const active = form.work_days
              .split('،')
              .map((x) => x.trim())
              .includes(d);
            return (
              <button
                type="button"
                key={d}
                onClick={() => toggleDay(d)}
                className={`px-3 py-1.5 rounded-md text-sm border ${
                  active
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white border-slate-300 text-slate-700 hover:border-primary-400'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="التدريبات الحاصل عليها">
        <textarea
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          value={form.trainings}
          onChange={(e) => set('trainings', e.target.value)}
          placeholder="مثال: دورة المشورة 2023، دورة الفحص..."
        />
      </Field>

      <div className="flex items-center gap-4 pt-2 border-t">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set('is_active', e.target.checked)}
          />
          نشط
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.is_admin}
            onChange={(e) => set('is_admin', e.target.checked)}
          />
          مدير النظام (صلاحيات كاملة)
        </label>
      </div>

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

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-md flex items-center gap-2"
        >
          <Save size={18} />
          {saving ? 'جارٍ الحفظ...' : mode === 'create' ? 'إضافة المدخل' : 'حفظ التعديلات'}
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
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}