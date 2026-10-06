'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Pencil,
  Trash2,
  Plus,
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Info,
  Calendar,
  GraduationCap,
  Phone,
  Mail,
  CreditCard,
  Briefcase,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { Counselor } from '@/lib/types';

interface CounselorsListClientProps {
  counselors: Counselor[];
  isAdmin: boolean;
}

export function CounselorsListClient({
  counselors,
  isAdmin,
}: CounselorsListClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [specialtyFilter, setSpecialtyFilter] = useState<string>('all');
  const [selectedCounselor, setSelectedCounselor] = useState<Counselor | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Extract unique specialties for dropdown filter
  const specialties = useMemo(() => {
    const set = new Set<string>();
    counselors.forEach((c) => {
      if (c.specialty?.trim()) set.add(c.specialty.trim());
    });
    return Array.from(set).sort();
  }, [counselors]);

  // Stats calculation
  const stats = useMemo(() => {
    const total = counselors.length;
    const active = counselors.filter((c) => c.is_active).length;
    const inactive = total - active;
    const admins = counselors.filter((c) => c.is_admin).length;
    return { total, active, inactive, admins };
  }, [counselors]);

  // Filtered counselors list
  const filtered = useMemo(() => {
    return counselors.filter((c) => {
      // Status filter
      if (statusFilter === 'active' && !c.is_active) return false;
      if (statusFilter === 'inactive' && c.is_active) return false;

      // Specialty filter
      if (specialtyFilter !== 'all' && c.specialty?.trim() !== specialtyFilter) {
        return false;
      }

      // Search query
      if (!search.trim()) return true;
      const s = search.trim().toLowerCase();
      return (
        c.full_name?.toLowerCase().includes(s) ||
        c.national_id?.includes(s) ||
        c.phone?.includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        c.employee_code?.toLowerCase().includes(s) ||
        c.specialty?.toLowerCase().includes(s)
      );
    });
  }, [counselors, search, statusFilter, specialtyFilter]);

  async function handleDelete(id: string, name: string) {
    if (!isAdmin) return;
    if (!confirm(`هل أنت متأكد من حذف المدخل "${name}" نهائياً من النظام؟`)) {
      return;
    }

    setDeletingId(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/counselors/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل حذف المدخل');
      }
      setFeedback({ type: 'success', message: `تم حذف المدخل "${name}" بنجاح` });
      if (selectedCounselor?.id === id) {
        setSelectedCounselor(null);
      }
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء الحذف' });
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(id: string, currentActive: boolean, name: string) {
    if (!isAdmin) return;
    setLoadingAction(id);
    setFeedback(null);
    try {
      const res = await fetch(`/api/counselors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentActive }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'فشل تعديل حالة المدخل');
      }
      const newStatus = !currentActive ? 'تفعيل' : 'تعطيل';
      setFeedback({ type: 'success', message: `تم ${newStatus} حساب "${name}" بنجاح` });
      router.refresh();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'حدث خطأ أثناء تعديل الحالة' });
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-800">بيانات مقدمي المشورة (المدخلين)</h1>
            <span className="text-xs bg-primary-100 text-primary-800 font-semibold px-2.5 py-0.5 rounded-full">
              {stats.total} مدخل
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            إدارة ومتابعة سجلات مقدمي المشورة الأسرية والصحية على مستوى الجمهورية
          </p>
        </div>

        {isAdmin ? (
          <Link
            href="/counselors/new"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-4 py-2.5 rounded-lg shadow-sm transition text-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>إضافة مدخل جديد</span>
          </Link>
        ) : (
          <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 px-3 py-1.5 rounded-md text-xs font-medium self-start sm:self-auto">
            <Info size={14} className="text-slate-500" />
            <span>وضع العرض (الإضافة والتعديل والحذف متاحة لمدير النظام فقط)</span>
          </div>
        )}
      </div>

      {/* Admin Privilege Banner for non-admins */}
      {!isAdmin && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-lg p-3 text-xs flex items-center gap-2">
          <Info size={16} className="text-amber-600 shrink-0" />
          <span>
            أنت مسجل كمدخل. يمكنك استعراض بيانات الزملاء والبحث في القائمة. لإضافة مدخل جديد أو تعديل البيانات يرجى التواصل مع مدير النظام.
          </span>
        </div>
      )}

      {/* Feedback Toast */}
      {feedback && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertTriangle size={16} className="text-red-600" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">إجمالي المدخلين</div>
            <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</div>
          </div>
          <div className="p-2.5 bg-primary-50 text-primary-600 rounded-lg">
            <Users size={20} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">الحسابات النشطة</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.active}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">الحسابات المعطلة</div>
            <div className="text-2xl font-bold text-slate-600 mt-1">{stats.inactive}</div>
          </div>
          <div className="p-2.5 bg-slate-100 text-slate-600 rounded-lg">
            <UserX size={20} />
          </div>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">مديرو النظام</div>
            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.admins}</div>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
            <ShieldCheck size={20} />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-1">
            <Search
              size={16}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="بحث بالاسم، الكود، الرقم القومي، التليفون..."
              className="w-full pl-3 pr-9 py-2 border border-slate-300 rounded-md text-sm bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
            >
              <option value="all">جميع التخصصات ({specialties.length})</option>
              {specialties.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
            >
              <option value="all">جميع الحالات (النشط والمعطل)</option>
              <option value="active">الحسابات النشطة فقط ({stats.active})</option>
              <option value="inactive">الحسابات المعطلة فقط ({stats.inactive})</option>
            </select>
          </div>
        </div>

        {(search || statusFilter !== 'all' || specialtyFilter !== 'all') && (
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t">
            <span>
              تم العثور على <strong className="text-slate-800">{filtered.length}</strong> من أصل {counselors.length} مدخل
            </span>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setSpecialtyFilter('all');
              }}
              className="text-primary-600 hover:underline"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        )}
      </div>

      {/* Counselors Table */}
      <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-12 px-4">
            <Users size={36} className="mx-auto text-slate-300 mb-3" />
            <p className="text-base font-semibold text-slate-700">لا توجد نتائج مطابقة</p>
            <p className="text-xs text-slate-500 mt-1">
              جرب تغيير معايير البحث أو الفلترة
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold">المدخل</th>
                  <th className="px-3 py-3 text-right font-semibold">كود الموظف</th>
                  <th className="px-3 py-3 text-right font-semibold">الرقم القومي</th>
                  <th className="px-3 py-3 text-right font-semibold">رقم التليفون</th>
                  <th className="px-3 py-3 text-right font-semibold">التخصص</th>
                  <th className="px-3 py-3 text-right font-semibold">الحالة</th>
                  <th className="px-4 py-3 text-center font-semibold">
                    {isAdmin ? 'إجراءات الإدارة' : 'التفاصيل'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition">
                    {/* Name & Account */}
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span>{c.full_name}</span>
                        {c.is_admin && (
                          <span className="text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                            مدير
                          </span>
                        )}
                      </div>
                      {c.email && (
                        <div className="text-xs text-slate-500 mt-0.5" dir="ltr">
                          {c.email}
                        </div>
                      )}
                    </td>

                    {/* Employee Code */}
                    <td className="px-3 py-3 font-mono text-slate-700">
                      {c.employee_code ? (
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs">
                          {c.employee_code}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* National ID */}
                    <td className="px-3 py-3 font-mono text-slate-700" dir="ltr">
                      {c.national_id || <span className="text-slate-400">—</span>}
                    </td>

                    {/* Phone */}
                    <td className="px-3 py-3 font-mono text-slate-700" dir="ltr">
                      {c.phone ? (
                        <a
                          href={`tel:${c.phone}`}
                          className="hover:text-primary-600 transition"
                        >
                          {c.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Specialty */}
                    <td className="px-3 py-3">
                      {c.specialty ? (
                        <span className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full inline-block">
                          {c.specialty}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="px-3 py-3">
                      {c.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                          معطل
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Details Modal button */}
                        <button
                          type="button"
                          onClick={() => setSelectedCounselor(c)}
                          className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded transition"
                          title="عرض التفاصيل الكاملة"
                        >
                          <Info size={16} />
                        </button>

                        {/* Admin-only controls */}
                        {isAdmin && (
                          <>
                            {/* Edit */}
                            <Link
                              href={`/counselors/${c.id}/edit`}
                              className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded transition"
                              title="تعديل بيانات المدخل"
                            >
                              <Pencil size={16} />
                            </Link>

                            {/* Toggle Active */}
                            <button
                              type="button"
                              disabled={loadingAction === c.id}
                              onClick={() => handleToggle(c.id, c.is_active, c.full_name)}
                              className={`p-1.5 rounded transition ${
                                c.is_active
                                  ? 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                              }`}
                              title={c.is_active ? 'تعطيل الحساب' : 'تفعيل الحساب'}
                            >
                              {c.is_active ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                            </button>

                            {/* Delete */}
                            <button
                              type="button"
                              disabled={deletingId === c.id}
                              onClick={() => handleDelete(c.id, c.full_name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                              title="حذف المدخل"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Counselor Details Modal */}
      {selectedCounselor && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {selectedCounselor.full_name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {selectedCounselor.is_admin && (
                    <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-medium">
                      مدير النظام
                    </span>
                  )}
                  {selectedCounselor.is_active ? (
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-medium">
                      حساب نشط
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                      حساب معطل
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedCounselor(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <CreditCard size={13} />
                  <span>كود الموظف</span>
                </div>
                <div className="font-semibold text-slate-800 mt-1 font-mono">
                  {selectedCounselor.employee_code || '—'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Briefcase size={13} />
                  <span>التخصص</span>
                </div>
                <div className="font-semibold text-slate-800 mt-1">
                  {selectedCounselor.specialty || '—'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <CreditCard size={13} />
                  <span>الرقم القومي</span>
                </div>
                <div className="font-semibold text-slate-800 mt-1 font-mono" dir="ltr">
                  {selectedCounselor.national_id || '—'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone size={13} />
                  <span>رقم التليفون</span>
                </div>
                <div className="font-semibold text-slate-800 mt-1 font-mono" dir="ltr">
                  {selectedCounselor.phone || '—'}
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg col-span-2">
                <div className="text-xs text-slate-500 flex items-center gap-1">
                  <Mail size={13} />
                  <span>البريد الإلكتروني / اسم المستخدم</span>
                </div>
                <div className="font-medium text-slate-800 mt-1" dir="ltr">
                  {selectedCounselor.email || '—'}
                </div>
              </div>
            </div>

            {/* Work Days */}
            <div className="border-t pt-3">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                <Calendar size={14} />
                <span>أيام العمل المقررة</span>
              </div>
              {selectedCounselor.work_days ? (
                <div className="flex flex-wrap gap-1.5">
                  {selectedCounselor.work_days
                    .split(/[،,]/)
                    .map((d) => d.trim())
                    .filter(Boolean)
                    .map((day, idx) => (
                      <span
                        key={idx}
                        className="bg-primary-50 text-primary-700 border border-primary-100 text-xs px-2.5 py-1 rounded-md"
                      >
                        {day}
                      </span>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">لم يتم تحديد أيام العمل</p>
              )}
            </div>

            {/* Trainings */}
            <div className="border-t pt-3">
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1 mb-2">
                <GraduationCap size={14} />
                <span>التدريبات والدورات الحاصل عليها</span>
              </div>
              {selectedCounselor.trainings ? (
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
                  {selectedCounselor.trainings}
                </p>
              ) : (
                <p className="text-xs text-slate-400">لا توجد بيانات تدريبات مسجلة</p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t pt-4 flex items-center justify-between">
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <Link
                    href={`/counselors/${selectedCounselor.id}/edit`}
                    className="bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md flex items-center gap-1"
                  >
                    <Pencil size={13} />
                    <span>تعديل البيانات</span>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedCounselor.id, selectedCounselor.full_name)}
                    className="bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-1.5 rounded-md flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>حذف المدخل</span>
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedCounselor(null)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-4 py-1.5 rounded-md mr-auto"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
