import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listCounselors, getDashboardStats, listVisits } from '@/lib/queries';
import { ReportsClient } from './reports-client';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: { type?: string; from?: string; to?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const counselors = await listCounselors(true);
  const stats = await getDashboardStats(searchParams.from, searchParams.to);
  const visits = await listVisits({
    visit_type: searchParams.type as any,
    date_from: searchParams.from,
    date_to: searchParams.to,
    limit: 1000,
  });

  return (
    <ReportsClient
      stats={stats}
      counselors={counselors}
      visits={visits}
      initialFilters={{
        type: searchParams.type,
        from: searchParams.from,
        to: searchParams.to,
      }}
    />
  );
}