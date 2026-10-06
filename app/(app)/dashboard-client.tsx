'use client';

import Link from 'next/link';
import {
  Users,
  ClipboardList,
  Stethoscope,
  Heart,
  Baby,
  Calendar,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
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
} from 'recharts';
import type { DashboardStats } from '@/lib/queries';
import { VISIT_TYPE_LABEL, VISIT_TYPE_SHORT, type VisitType } from '@/lib/types';

const COLORS: Record<VisitType, string> = {
  pre_marriage: '#0ea5e9',
  children: '#f97316',
  pregnancy: '#ec4899',
  family_planning: '#10b981',
};

export function DashboardClient({ stats }: { stats: DashboardStats }) {
  const typeData = (Object.keys(stats.visits_by_type) as VisitType[]).map(
    (k) => ({
      name: VISIT_TYPE_SHORT[k],
      value: stats.visits_by_type[k],
      full: VISIT_TYPE_LABEL[k],
    })
  );

  const counselorData = stats.visits_by_counselor.slice(0, 10).map((c) => ({
    name: c.name,
    count: c.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">الرئيسية</h1>
        <p className="text-sm text-slate-500 mt-1">
          نظرة عامة على نشاط غرف المشورة
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="إجمالي الزيارات"
          value={stats.total_visits}
          icon={ClipboardList}
          color="bg-sky-500"
        />
        <StatCard
          label="إجمالي العملاء"
          value={stats.total_clients}
          icon={Users}
          color="bg-emerald-500"
        />
        <StatCard
          label="المدخلون النشطون"
          value={stats.total_counselors}
          icon={Stethoscope}
          color="bg-purple-500"
        />
        <StatCard
          label="أنواع المشورة"
          value={4}
          icon={Heart}
          color="bg-rose-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3">الزيارات حسب نوع المشورة</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={typeData}
                cx="50%"
                cy="50%"
                outerRadius={90}
                dataKey="value"
                label={(d) => `${d.name}: ${d.value}`}
              >
                {typeData.map((entry, i) => {
                  const key = (Object.keys(stats.visits_by_type) as VisitType[])[i];
                  return <Cell key={i} fill={COLORS[key]} />;
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="text-base font-semibold mb-3">أعلى المدخلين نشاطاً</h2>
          {counselorData.length === 0 ? (
            <EmptyChart text="لا توجد بيانات بعد" />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={counselorData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <h2 className="text-base font-semibold mb-3">الزيارات الشهرية</h2>
        {stats.visits_by_month.length === 0 ? (
          <EmptyChart text="لا توجد بيانات بعد" />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.visits_by_month}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Recent visits */}
      <div className="bg-white rounded-lg border p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">آخر الزيارات</h2>
          <Link
            href="/visits"
            className="text-sm text-primary-600 hover:underline"
          >
            عرض الكل
          </Link>
        </div>
        {stats.recent_visits.length === 0 ? (
          <p className="text-sm text-slate-500 py-6 text-center">
            لا توجد زيارات بعد
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-right">التاريخ</th>
                  <th className="px-3 py-2 text-right">العميل</th>
                  <th className="px-3 py-2 text-right">نوع المشورة</th>
                  <th className="px-3 py-2 text-right">المدخل</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_visits.map((v) => (
                  <tr key={v.id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-2">
                      {v.visit_date ?? v.created_at.slice(0, 10)}
                    </td>
                    <td className="px-3 py-2">
                      <Link
                        href={`/visits/${v.id}`}
                        className="text-primary-600 hover:underline"
                      >
                        {v.client?.full_name ?? '—'}
                      </Link>
                    </td>
                    <td className="px-3 py-2">
                      <TypeBadge type={v.visit_type} />
                    </td>
                    <td className="px-3 py-2">
                      {v.counselor?.full_name ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink href="/visits/new?type=pre_marriage" label="مشورة ما قبل الزواج" Icon={Heart} />
        <QuickLink href="/visits/new?type=children" label="مشورة الأطفال" Icon={Baby} />
        <QuickLink href="/visits/new?type=pregnancy" label="مشورة الحوامل" Icon={Stethoscope} />
        <QuickLink href="/visits/new?type=family_planning" label="تنظيم الأسرة" Icon={Calendar} />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-2xl font-bold mt-1 text-slate-800">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color} text-white`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white border rounded-lg p-4 hover:border-primary-400 hover:shadow-md transition"
    >
      <Icon size={24} className="text-primary-600" />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
      {text}
    </div>
  );
}

function TypeBadge({ type }: { type: VisitType }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs"
      style={{ background: COLORS[type] + '20', color: COLORS[type] }}
    >
      {VISIT_TYPE_SHORT[type]}
    </span>
  );
}