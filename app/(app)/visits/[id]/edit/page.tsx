import { redirect, notFound } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';
import { getVisit, getClient, listCounselors } from '@/lib/queries';
import { VisitForm } from '@/components/VisitForm';
import type { VisitType } from '@/lib/types';

export default async function EditVisitPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getSessionUser();
  if (!session) redirect('/login');

  const visit = await getVisit(params.id);
  if (!visit) notFound();

  const client = visit.client ?? (await getClient(visit.client_id));
  const counselors = await listCounselors();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-800">تعديل الزيارة</h1>
      <VisitForm
        type={visit.visit_type as VisitType}
        client={client}
        existingData={visit.data ?? {}}
        existingVisit={{
          id: visit.id,
          governorate: visit.governorate,
          governorate_mfl: visit.governorate_mfl,
          district: visit.district,
          district_mfl: visit.district_mfl,
          health_facility: visit.health_facility,
          health_facility_mfl: visit.health_facility_mfl,
          counselor_name: visit.counselor_name,
          counselor_phone: visit.counselor_phone,
          first_visit_date: visit.first_visit_date,
          case_number: visit.case_number,
          session_number: visit.session_number,
          visit_date: visit.visit_date,
          notes: visit.notes,
        }}
        counselors={counselors}
        isEdit
        prefillFromClient={false}
      />
    </div>
  );
}