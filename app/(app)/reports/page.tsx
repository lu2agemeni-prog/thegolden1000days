import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listCounselors, getDashboardStats, listVisits } from '@/lib/queries';
import { ReportsClient } from './reports-client';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { type?: string; from?: string; to?: string; month?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  // Derive from/to from the `month` shortcut if provided.
  let { from, to } = searchParams;
  if (searchParams.month && /^\d{4}-\d{2}$/.test(searchParams.month)) {
    const [y, m] = searchParams.month.split('-').map(Number);
    from = `${searchParams.month}-01`;
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const last = new Date(nextMonth);
    last.setDate(last.getDate() - 1);
    to = last.toISOString().slice(0, 10);
  }

  const counselors = await listCounselors(true);
  const stats = await getDashboardStats(from, to);
  const visits = await listVisits({
    visit_type: searchParams.type as any,
    date_from: from,
    date_to: to,
    limit: 1000,
  });

  return (
    <ReportsClient
      stats={stats}
      counselors={counselors}
      visits={visits}
      initialFilters={{
        type: searchParams.type,
        from,
        to,
        month: searchParams.month,
      }}
    />
  );
}
