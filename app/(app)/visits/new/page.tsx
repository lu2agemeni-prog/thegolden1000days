import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { listCounselors } from '@/lib/queries';
import { VISIT_TYPE_LABEL, VISIT_TYPES, type VisitType } from '@/lib/types';
import { NewVisitPage } from './new-visit-client';

export default async function NewVisitRootPage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const requested = searchParams.type as VisitType | undefined;
  const counselors = await listCounselors();

  return (
    <NewVisitPage
      initialType={requested && VISIT_TYPES.includes(requested) ? requested : null}
      counselors={counselors}
    />
  );
}