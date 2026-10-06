'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { FileText, FileSpreadsheet, Filter, Printer, Calendar } from 'lucide-react';
import {
  VISIT_TYPES,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_SHORT,
  type VisitType,
  type Counselor,
  type VisitWithRelations,
} from '@/lib/types';
import type { DashboardStats } from '@/lib/queries';

const COLORS: Record<VisitType, string> = {
  pre_marriage: '#0ea5e9',
  children: '#f97316',
  pregnancy: '#ec4899',
  family_planning: '#10b981',
};

/** Build the last 12 months as YYYY-MM strings (most recent first). */
function recentMonths(): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const v = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const l = d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' });
    out.push({ value: v, label: l });
  }
  return out;
}

export function ReportsClient({
  stats,
  counselors,
  visits,
  initialFilters,
}: {
  stats: DashboardStats;
  counselors: Counselor[];
  visits: VisitWithRelations[];
  initialFilters: {
    type?: string;
    from?: string;
    to?: string;
    month?: string;
  };
}) {
  const router = useRouter();
  const [type, setType] = useState(initialFilters.type ?? '');
  const [from, setFrom] = useState(initialFilters.from ?? '');
  const [to, setTo] = useState(initialFilters.to ?? '');
  const [month, setMonth] = useState(initialFilters.month ?? '');

  function applyFilters() {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (month) {
      params.set('month', month);
    } else {
      if (from) params.set('from', from);
      if (to) params.set('to', to);
    }
    router.push(`/reports?${params.toString()}`);
  }

  function clearFilters() {
    setType('');
    setFrom('');
    setTo('');
    setMonth('');
    router.push('/reports');
  }

  /** Quick shortcut — set the month and submit. */
  function pickMonth(value: string) {
    setMonth(value);
    if (value) {
      const params = new URLSearchParams();
      if (type) params.set('type', type);
      params.set('month', value);
      router.push(`/reports?${params.toString()}`);
    }
  }

  async function exportPDF() {
    const { default: jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt' });

    doc.setFontSize(16);
    doc.text('Counseling Visits Report', 40, 40, { align: 'left' });
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString('en-GB')}`, 40, 60);

    let filters = 'Filters: ';
    if (type) filters += `Type=${VISIT_TYPE_SHORT[type as VisitType]}, `;
    if (month) filters += `Month=${month}, `;
    if (from) filters += `From=${from}, `;
    if (to) filters += `To=${to}, `;
    doc.text(filters, 40, 78);

    autoTable(doc, {
      startY: 100,
      head: [['Metric', 'Value']],
      body: [
        ['Total visits', String(stats.total_visits)],
        ['Total clients', String(stats.total_clients)],
        ['Active counselors', String(stats.total_counselors)],
        ['Pre-marriage', String(stats.visits_by_type.pre_marriage)],
        ['Children', String(stats.visits_by_type.children)],
        ['Pregnancy', String(stats.visits_by_type.pregnancy)],
        ['Family planning', String(stats.visits_by_type.family_planning)],
      ],
      theme: 'grid',
      headStyles: { fillColor: [14, 165, 233] },
    });

    const rows = visits.slice(0, 200).map((v) => [
      v.visit_date ?? v.created_at.slice(0, 10),
      v.client?.full_name ?? '—',
      v.client?.national_id ?? '—',
      VISIT_TYPE_SHORT[v.visit_type],
      v.counselor?.full_name ?? v.counselor_name ?? '—',
      v.health_facility ?? '—',
    ]);

    autoTable(doc, {
      head: [['Date', 'Client', 'National ID', 'Type', 'Counselor', 'Facility']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] },
      styles: { fontSize: 8 },
    });

    if (visits.length > 200) {
      const lastTable = (doc as any).lastAutoTable;
      doc.text(
        `Showing first 200 of ${visits.length} visits. Use the Excel export for the full list.`,
        40,
        lastTable.finalY + 20
      );
    }

    doc.save(`report-${Date.now()}.pdf`);
  }

  // Build the export URL with the same filters
  const exportParams = new URLSearchParams();
  if (type) exportParams.set('type', type);
  if (month) exportParams.set('month', month);
  else {
    if (from) exportParams.set('from', from);
    if (to) exportParams.set('to', to);
  }
  const exportHref = `/api/export/monthly?${exportParams.toString()}`;

  const typeData = useMemo(
    () =>
      (Object.keys(stats.visits_by_type) as VisitType[]).map((k) => ({
        name: VISIT_TYPE_SHORT[k],
        value: stats.visits_by_type[k],
      })),
    [stats]
  );

  const monthData = stats.visits_by_month;
  const monthsList = useMemo(recentMonths, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">التقارير والإحصائيات</h1>
          <p className="text-sm text-slate-500 mt-1">
            فلترة الزيارات وعرض الرسوم البيانية، ثم تصدير PDF أو Excel
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
          >
            <FileText size={14} />
            تصدير PDF
          </button>
          <a
            href={exportHref}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
          >
            <FileSpreadsheet size={14} />
            تصدير Excel
          </a>
          <button
            onClick={() => window.print()}
            className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
          >
            <Printer size={14} />
            طباعة
          </button>
        </div>
      </div>

      {/* Quick month shortcuts */}
      <div className="bg-white border rounded-lg p-4 shadow-sm no-print">
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Calendar size={14} />
          <span className="font-semibold">تصدير سريع حسب الشهر:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {monthsList.map((m) => (
            <a
              key={m.value}
              href={`/api/export/monthly?month=${m.value}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                month === m.value
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {m.label}
            </a>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-2">
          اضغط على الشهر لتحميل تقرير Excel مباشرة بنفس ترتيب أعمدة ملف 1000.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-lg p-4 shadow-sm no-print">
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
                  {VISIT_TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">شهر مخصص</label>
            <input
              type="month"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={month}
              onChange={(e) => {
                setMonth(e.target.value);
                if (e.target.value) {
                  setFrom('');
                  setTo('');
                }
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">من تاريخ</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                if (e.target.value) setMonth('');
              }}
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">إلى تاريخ</label>
            <input
              type="date"
              className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm bg-white"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                if (e.target.value) setMonth('');
              }}
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={applyFilters}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-1.5 rounded text-sm flex items-center gap-1"
            >
              <Filter size={14} />
              تطبيق
            </button>
            {(type || from || to || month) && (
              <button
                onClick={clearFilters}
                className="text-sm text-slate-500 hover:underline"
              >
                مسح
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="إجمالي الزيارات" value={stats.total_visits} />
        <SummaryCard label="إجمالي العملاء" value={stats.total_clients} />
        <SummaryCard label="المدخلون النشطون" value={stats.total_counselors} />
        <SummaryCard label="عدد السجلات في الجدول" value={visits.length} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="الزيارات حسب نوع المشورة">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={typeData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={(d) => `${d.name}: ${d.value}`}>
                {typeData.map((_, i) => {
                  const k = (Object.keys(stats.visits_by_type) as VisitType[])[i];
                  return <Cell key={i} fill={COLORS[k]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="أعلى المدخلين نشاطاً">
          {stats.visits_by_counselor.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-10">لا توجد بيانات</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.visits_by_counselor.slice(0, 10)} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <ChartCard title="الزيارات الشهرية">
        {monthData.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-10">لا توجد بيانات</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      {/* Detailed stats table */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold mb-3">تفاصيل حسب نوع المشورة</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-right">نوع المشورة</th>
                <th className="px-3 py-2 text-right">عدد الزيارات</th>
                <th className="px-3 py-2 text-right">النسبة</th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(stats.visits_by_type) as VisitType[]).map((t) => {
                const v = stats.visits_by_type[t];
                const pct = stats.total_visits > 0 ? ((v / stats.total_visits) * 100).toFixed(1) : '0';
                return (
                  <tr key={t} className="border-t">
                    <td className="px-3 py-2">
                      <span
                        className="inline-block px-2 py-0.5 rounded text-xs"
                        style={{ background: COLORS[t] + '20', color: COLORS[t] }}
                      >
                        {VISIT_TYPE_LABEL[t]}
                      </span>
                    </td>
                    <td className="px-3 py-2 font-semibold">{v}</td>
                    <td className="px-3 py-2">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Counselors breakdown */}
      <div className="bg-white border rounded-lg p-4 shadow-sm">
        <h2 className="text-base font-semibold mb-3">المدخلون وحجم العمل</h2>
        {stats.visits_by_counselor.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">لا توجد بيانات</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-3 py-2 text-right">المدخل</th>
                  <th className="px-3 py-2 text-right">عدد الزيارات</th>
                </tr>
              </thead>
              <tbody>
                {stats.visits_by_counselor.map((c: { id: string; name: string; count: number }) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{c.name}</td>
                    <td className="px-3 py-2 font-semibold">{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h2 className="text-base font-semibold mb-3">{title}</h2>
      {children}
    </div>
  );
}
