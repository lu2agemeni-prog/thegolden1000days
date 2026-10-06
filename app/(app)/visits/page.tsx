import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { listVisits, listCounselors } from '@/lib/queries';
import { VISIT_TYPE_LABEL, VISIT_TYPE_SHORT, VISIT_TYPES, type VisitType } from '@/lib/types';
import { VisitsListClient } from './list-client';

export default async function VisitsPage({
  searchParams,
}: {
  searchParams: { type?: string; counselor?: string; from?: string; to?: string; q?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const type =
    searchParams.type && VISIT_TYPES.includes(searchParams.type as VisitType)
      ? (searchParams.type as VisitType)
      : undefined;

  const visits = await listVisits({
    visit_type: type,
    counselor_id: searchParams.counselor,
    date_from: searchParams.from,
    date_to: searchParams.to,
    search: searchParams.q,
  });

  const counselors = await listCounselors(true);

  return (
    <VisitsListClient
      initialVisits={visits}
      counselors={counselors}
      initialFilters={{
        type,
        counselor: searchParams.counselor,
        from: searchParams.from,
        to: searchParams.to,
        q: searchParams.q,
      }}
    />
  );
}