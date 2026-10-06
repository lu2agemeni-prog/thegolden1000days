'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Filter, FileDown, Eye, Pencil, Trash2 } from 'lucide-react';
import {
  VISIT_TYPE_SHORT,
  VISIT_TYPES,
  type VisitType,
  type Counselor,
  type VisitWithRelations,
} from '@/lib/types';

const COLORS: Record<VisitType, string> = {
  pre_marriage: '#0ea5e9',
  children: '#f97316',
  pregnancy: '#ec4899',
  family_planning: '#10b981',
};

export function VisitsListClient({
  initialVisits,
  counselors,
  initialFilters,
}: {
  initialVisits: VisitWithRelations[];
  counselors: Counselor[];
  initialFilters: {
    type?: VisitType;
    counselor?: string;
    from?: string;
    to?: string;
    q?: string;
  };
}) {
  const router = useRouter();
  const [type, setType] = useState<string>(initialFilters.type ?? '');
  const [counselor, setCounselor] = useState<string>(initialFilters.counselor ?? '');
  const [from, setFrom] = useState<string>(initialFilters.from ?? '');
  const [to, setTo] = useState<string>(initialFilters.to ?? '');
  const [q, setQ] = useState<string>(initialFilters.q ?? '');

  function applyFilters(e?: React.FormEvent) {
    e?.preventDefault();
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (counselor) params.set('counselor', counselor);
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    if (q) params.set('q', q);
    router.push(`/visits?${params.toString()}`);
  }

  function clearFilters() {
    setType('');
    setCounselor('');
    setFrom('');
    setTo('');
    setQ('');
    router.push('/visits');
  }

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذه الزيارة؟')) return;
    const res = await fetch(`/api/visits/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.refresh();
    } else {
      alert('فشل الحذف');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">الزيارات</h1>
          <p className="text-sm text-slate-500 mt-1">
            إجمالي النتائج: {initialVisits.length}
          </p>
        </div>
        <Link
          href="/visits/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
        >
          + زيارة جديدة
        </Link>
      </div>

      {/* Filters */}
      <form
        onSubmit={applyFilters}
        className="bg-white border rounded-lg p-4 shadow-sm"
      >
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">نوع المشورة</label>
            <select
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="">الكل</option>
              {VISIT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {VISIT_TYPE_SHORT[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">المدخل</label>
            <select
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={counselor}
              onChange={(e) => setCounselor(e.target.value)}
            >
              <option value="">الكل</option>
              {counselors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">من تاريخ</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">بحث (اسم/قومي)</label>
            <div className="flex gap-1">
              <input
                type="text"
                className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-sm"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="..."
              />
              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded"
              >
                <Filter size={14} />
              </button>
            </div>
          </div>
        </div>
        {(type || counselor || from || to || q) && (
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-slate-500 hover:text-red-600"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </form>

      {/* Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {initialVisits.length === 0 ? (
          <p className="text-sm text-slate-500 py-10 text-center">لا توجد زيارات</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-right">التاريخ</th>
                <th className="px-3 py-2 text-right">العميل</th>
                <th className="px-3 py-2 text-right">الرقم القومي</th>
                <th className="px-3 py-2 text-right">النوع</th>
                <th className="px-3 py-2 text-right">المدخل</th>
                <th className="px-3 py-2 text-right">المنشأة</th>
                <th className="px-3 py-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {initialVisits.map((v) => (
                <tr key={v.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 whitespace-nowrap">
                    {v.visit_date ?? v.created_at.slice(0, 10)}
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/visits/${v.id}`}
                      className="text-primary-600 hover:underline font-medium"
                    >
                      {v.client?.full_name ?? '—'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 ltr:text-left" dir="ltr">
                    {v.client?.national_id ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs"
                      style={{ background: COLORS[v.visit_type] + '20', color: COLORS[v.visit_type] }}
                    >
                      {VISIT_TYPE_SHORT[v.visit_type]}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    {v.counselor?.full_name ?? v.counselor_name ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    {v.health_facility ?? '—'}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/visits/${v.id}`}
                        className="text-slate-500 hover:text-primary-600"
                        title="عرض"
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        href={`/visits/${v.id}/edit`}
                        className="text-slate-500 hover:text-amber-600"
                        title="تعديل"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleDelete(v.id)}
                        className="text-slate-500 hover:text-red-600"
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}