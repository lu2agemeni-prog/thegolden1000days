import { createClient } from '@/lib/supabase/server';
import type { Client, Visit, VisitType, Counselor, VisitWithRelations } from '@/lib/types';

// =========================================================
// Clients
// =========================================================
export async function searchClients(
  type: VisitType,
  query: string
): Promise<Client[]> {
  const supabase = createClient();
  const q = query.trim();
  if (q.length < 2) return [];

  // search by national id (exact) OR name (ilike)
  const isDigits = /^\d+$/.test(q);
  let queryBuilder = supabase
    .from('clients')
    .select('*')
    .eq('client_type', type)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (isDigits) {
    queryBuilder = queryBuilder.or(`national_id.ilike.%${q}%,phone.ilike.%${q}%`);
  } else {
    queryBuilder = queryBuilder.ilike('full_name', `%${q}%`);
  }

  const { data, error } = await queryBuilder;
  if (error) throw error;
  return (data ?? []) as Client[];
}

export async function getClient(id: string): Promise<Client | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export async function findClientByNationalId(
  type: VisitType,
  nationalId: string
): Promise<Client | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('client_type', type)
    .eq('national_id', nationalId)
    .maybeSingle();
  if (error) throw error;
  return data as Client | null;
}

export async function upsertClient(
  client: Partial<Client> & {
    client_type: VisitType;
    national_id: string;
    full_name: string;
  }
): Promise<Client> {
  const supabase = createClient();

  const existing = await findClientByNationalId(
    client.client_type,
    client.national_id
  );

  const payload = {
    client_type: client.client_type,
    national_id: client.national_id,
    full_name: client.full_name,
    phone: client.phone ?? null,
    spouse_name: client.spouse_name ?? null,
    spouse_national_id: client.spouse_national_id ?? null,
    spouse_phone: client.spouse_phone ?? null,
    meta: client.meta ?? {},
  };

  if (existing) {
    const { data, error } = await supabase
      .from('clients')
      .update(payload)
      .eq('id', existing.id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Client;
  }

  const { data, error } = await supabase
    .from('clients')
    .insert(payload)
    .select('*')
    .single();
  if (error) throw error;
  return data as Client;
}

// =========================================================
// Visits
// =========================================================
export interface VisitInput {
  visit_type: VisitType;
  client_id: string;
  counselor_id?: string | null;
  governorate?: string | null;
  governorate_mfl?: string | null;
  district?: string | null;
  district_mfl?: string | null;
  health_facility?: string | null;
  health_facility_mfl?: string | null;
  counselor_name?: string | null;
  counselor_phone?: string | null;
  first_visit_date?: string | null;
  case_number?: string | null;
  session_number?: string | null;
  visit_date?: string | null;
  data?: Record<string, unknown>;
  notes?: string | null;
}

export async function createVisit(input: VisitInput): Promise<Visit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visits')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function updateVisit(id: string, input: Partial<VisitInput>): Promise<Visit> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visits')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Visit;
}

export async function deleteVisit(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('visits').delete().eq('id', id);
  if (error) throw error;
}

export async function getVisit(id: string): Promise<VisitWithRelations | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*, client:clients(*), counselor:counselors(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as VisitWithRelations | null;
}

export async function getClientVisits(clientId: string): Promise<VisitWithRelations[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('visits')
    .select('*, counselor:counselors(*)')
    .eq('client_id', clientId)
    .order('visit_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as VisitWithRelations[];
}

export interface ListVisitsParams {
  visit_type?: VisitType;
  counselor_id?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  limit?: number;
}

export async function listVisits(
  params: ListVisitsParams = {}
): Promise<VisitWithRelations[]> {
  const supabase = createClient();
  let q = supabase
    .from('visits')
    .select('*, client:clients(*), counselor:counselors(*)')
    .order('created_at', { ascending: false })
    .limit(params.limit ?? 200);

  if (params.visit_type) q = q.eq('visit_type', params.visit_type);
  if (params.counselor_id) q = q.eq('counselor_id', params.counselor_id);
  if (params.date_from) q = q.gte('visit_date', params.date_from);
  if (params.date_to) q = q.lte('visit_date', params.date_to);

  const { data, error } = await q;
  if (error) throw error;

  let visits = (data ?? []) as VisitWithRelations[];

  if (params.search) {
    const s = params.search.toLowerCase();
    visits = visits.filter((v) => {
      const c = v.client;
      return (
        c?.full_name?.toLowerCase().includes(s) ||
        c?.national_id?.includes(s) ||
        c?.phone?.includes(s) ||
        v.case_number?.toLowerCase().includes(s)
      );
    });
  }

  return visits;
}

// =========================================================
// Counselors
// =========================================================
export async function listCounselors(includeInactive = false): Promise<Counselor[]> {
  const supabase = createClient();
  let q = supabase
    .from('counselors')
    .select('*')
    .order('full_name', { ascending: true });
  if (!includeInactive) q = q.eq('is_active', true);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as Counselor[];
}

export async function createCounselor(input: Partial<Counselor>): Promise<Counselor> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('counselors')
    .insert(input)
    .select('*')
    .single();
  if (error) throw error;
  return data as Counselor;
}

export async function updateCounselor(id: string, input: Partial<Counselor>): Promise<Counselor> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('counselors')
    .update(input)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data as Counselor;
}

export async function deleteCounselor(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from('counselors').delete().eq('id', id);
  if (error) throw error;
}

// =========================================================
// Stats for dashboard
// =========================================================
export interface DashboardStats {
  total_visits: number;
  total_clients: number;
  total_counselors: number;
  visits_by_type: Record<VisitType, number>;
  visits_by_counselor: { id: string; name: string; count: number }[];
  visits_by_month: { month: string; count: number }[];
  recent_visits: VisitWithRelations[];
}

export async function getDashboardStats(
  dateFrom?: string,
  dateTo?: string
): Promise<DashboardStats> {
  const supabase = createClient();

  const visitsQ = supabase
    .from('visits')
    .select('id, visit_type, counselor_id, visit_date, created_at, client:clients(full_name), counselor:counselors(id, full_name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .limit(5000);
  if (dateFrom) visitsQ.gte('visit_date', dateFrom);
  if (dateTo) visitsQ.lte('visit_date', dateTo);

  const { data: visits, count: total } = await visitsQ;

  const v = (visits ?? []) as unknown as Array<{
    id: string;
    visit_type: VisitType;
    counselor_id: string | null;
    visit_date: string | null;
    created_at: string;
    counselor: { id: string; full_name: string } | null;
  }>;

  const visits_by_type: Record<VisitType, number> = {
    pre_marriage: 0,
    children: 0,
    pregnancy: 0,
    family_planning: 0,
  };
  const byCounselorMap = new Map<string, { id: string; name: string; count: number }>();
  const byMonthMap = new Map<string, number>();

  v.forEach((row) => {
    visits_by_type[row.visit_type] = (visits_by_type[row.visit_type] ?? 0) + 1;
    if (row.counselor_id && row.counselor) {
      const existing = byCounselorMap.get(row.counselor_id);
      if (existing) existing.count++;
      else byCounselorMap.set(row.counselor_id, { id: row.counselor_id, name: row.counselor.full_name, count: 1 });
    }
    const dt = row.visit_date ?? row.created_at.slice(0, 10);
    const ym = dt.slice(0, 7);
    byMonthMap.set(ym, (byMonthMap.get(ym) ?? 0) + 1);
  });

  const visits_by_month = [...byMonthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));

  const visits_by_counselor = [...byCounselorMap.values()].sort(
    (a, b) => b.count - a.count
  );

  const { count: totalCounselors } = await supabase
    .from('counselors')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);

  const { count: totalClients } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true });

  const { data: recent } = await supabase
    .from('visits')
    .select('*, client:clients(*), counselor:counselors(*)')
    .order('created_at', { ascending: false })
    .limit(10);

  return {
    total_visits: total ?? v.length,
    total_clients: totalClients ?? 0,
    total_counselors: totalCounselors ?? 0,
    visits_by_type,
    visits_by_counselor,
    visits_by_month,
    recent_visits: ((recent ?? []) as VisitWithRelations[]),
  };
}