'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
import type { Counselor } from '@/lib/types';

export function CounselorsListClient({
  counselors,
}: {
  counselors: Counselor[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = counselors.filter((c) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(s) ||
      c.national_id?.includes(s) ||
      c.phone?.includes(s) ||
      c.email?.toLowerCase().includes(s) ||
      c.employee_code?.toLowerCase().includes(s)
    );
  });

  async function handleDelete(id: string) {
    if (!confirm('هل أنت متأكد من حذف هذا المدخل؟')) return;
    const r = await fetch(`/api/counselors/${id}`, { method: 'DELETE' });
    if (r.ok) router.refresh();
    else alert('فشل الحذف');
  }

  async function handleToggle(id: string, active: boolean) {
    const r = await fetch(`/api/counselors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !active }),
    });
    if (r.ok) router.refresh();
    else alert('فشل التحديث');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">المدخلون</h1>
          <p className="text-sm text-slate-500 mt-1">
            إدارة قائمة مقدمي المشورة (المدخلين على النظام)
          </p>
        </div>
        <Link
          href="/counselors/new"
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
        >
          <Plus size={14} />
          إضافة مدخل جديد
        </Link>
      </div>

      <div className="bg-white border rounded-lg p-3 shadow-sm">
        <input
          type="text"
          placeholder="بحث بالاسم، الرقم القومي، الكود..."
          className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white border rounded-lg shadow-sm overflow-x-auto">
        {filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-10 text-center">لا يوجد مدخلون</p>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-3 py-2 text-right">الاسم</th>
                <th className="px-3 py-2 text-right">الكود</th>
                <th className="px-3 py-2 text-right">الرقم القومي</th>
                <th className="px-3 py-2 text-right">التليفون</th>
                <th className="px-3 py-2 text-right">البريد</th>
                <th className="px-3 py-2 text-right">التخصص</th>
                <th className="px-3 py-2 text-right">الحالة</th>
                <th className="px-3 py-2 text-right">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-2 font-medium">{c.full_name}</td>
                  <td className="px-3 py-2">{c.employee_code ?? '—'}</td>
                  <td className="px-3 py-2" dir="ltr">{c.national_id ?? '—'}</td>
                  <td className="px-3 py-2" dir="ltr">{c.phone ?? '—'}</td>
                  <td className="px-3 py-2">{c.email ?? '—'}</td>
                  <td className="px-3 py-2">{c.specialty ?? '—'}</td>
                  <td className="px-3 py-2">
                    {c.is_active ? (
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                        نشط
                      </span>
                    ) : (
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        معطل
                      </span>
                    )}
                    {c.is_admin && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded mr-1">
                        مدير
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/counselors/${c.id}/edit`}
                        className="text-slate-500 hover:text-amber-600"
                        title="تعديل"
                      >
                        <Pencil size={16} />
                      </Link>
                      <button
                        onClick={() => handleToggle(c.id, c.is_active)}
                        className="text-slate-500 hover:text-primary-600"
                        title={c.is_active ? 'تعطيل' : 'تفعيل'}
                      >
                        {c.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
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