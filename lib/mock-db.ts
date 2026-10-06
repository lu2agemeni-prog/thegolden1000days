import type { Client, Counselor, Visit, VisitType, VisitWithRelations } from './types';

// Check if real Supabase environment variables are available and valid
export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes('placeholder') &&
    !url.includes('your-project') &&
    url.startsWith('http')
  );
}

// Initial seed counselors
const INITIAL_COUNSELORS: Counselor[] = [
  {
    id: 'c0000000-0000-0000-0000-000000000001',
    user_id: 'u0000000-0000-0000-0000-000000000001',
    full_name: 'د. سارة محمود أحمد',
    national_id: '29011150102345',
    phone: '01012345678',
    email: 'admin@health.gov.eg',
    employee_code: 'EMP-101',
    specialty: 'طبيبة بشرية - استشاري طب أسرة',
    work_days: 'السبت، الأحد، الثلاثاء، الخميس',
    trainings: 'دورة المشورة المتكاملة للألف يوم الذهبية 2023، فحص ما قبل الزواج',
    is_active: true,
    is_admin: true,
    created_at: '2025-01-01T08:00:00.000Z',
    updated_at: '2025-01-01T08:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000002',
    user_id: 'u0000000-0000-0000-0000-000000000002',
    full_name: 'د. منى عبد الفتاح السيد',
    national_id: '29204081203456',
    phone: '01123456789',
    email: 'mona.abdelfattah@health.gov.eg',
    employee_code: 'EMP-102',
    specialty: 'أخصائية نساء وتوليد',
    work_days: 'الأحد، الاثنين، الأربعاء',
    trainings: 'مشورة تنظيم الأسرة والولادة الطبيعية 2024',
    is_active: true,
    is_admin: false,
    created_at: '2025-01-05T08:00:00.000Z',
    updated_at: '2025-01-05T08:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000003',
    user_id: 'u0000000-0000-0000-0000-000000000003',
    full_name: 'أ. فاطمة إبراهيم علي',
    national_id: '29506122104567',
    phone: '01234567890',
    email: 'fatma.ali@health.gov.eg',
    employee_code: 'EMP-103',
    specialty: 'أخصائية تمريض ومشورة رضاعة',
    work_days: 'السبت، الاثنين، الأربعاء، الخميس',
    trainings: 'دورة دعم الرضاعة الطبيعية وتغذية الطفل الأولية',
    is_active: true,
    is_admin: false,
    created_at: '2025-01-10T08:00:00.000Z',
    updated_at: '2025-01-10T08:00:00.000Z',
  },
  {
    id: 'c0000000-0000-0000-0000-000000000004',
    user_id: 'u0000000-0000-0000-0000-000000000004',
    full_name: 'أ. هدى حسن عبد الله',
    national_id: '28909180105678',
    phone: '01545678901',
    email: 'hoda.hassan@health.gov.eg',
    employee_code: 'EMP-104',
    specialty: 'رائدة ريفية صحية',
    work_days: 'السبت، الأحد، الثلاثاء',
    trainings: 'مشورة الألف يوم الذهبية للرائدات الصحيات',
    is_active: true,
    is_admin: false,
    created_at: '2025-01-15T08:00:00.000Z',
    updated_at: '2025-01-15T08:00:00.000Z',
  },
  {
    id: 'db6b5189-9e0e-49cc-918c-ccaae07b66b5',
    user_id: null,
    full_name: 'ندى محمود عبدالعزيز ابراهيم',
    national_id: '30010011709303',
    phone: '01021348556',
    email: 'nadaesawynm',
    employee_code: '190',
    specialty: 'طبيب أسنان',
    work_days: '',
    trainings: '',
    is_active: true,
    is_admin: false,
    created_at: '2026-10-06T10:15:07.154Z',
    updated_at: '2026-10-06T10:15:07.154Z',
  },
];

// Initial seed clients
const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cl000000-0000-0000-0000-000000000001',
    client_type: 'pre_marriage',
    national_id: '29801010102345',
    full_name: 'أحمد كريم الشافعي',
    phone: '01098765432',
    spouse_name: 'نورهان عادل عبد المنعم',
    spouse_national_id: '29905050106789',
    spouse_phone: '01011223344',
    meta: {
      partner_age: 27,
      partner_education: 'مؤهل عالي',
      partner_job: 'يعمل',
      spouse_age: 25,
      spouse_education: 'مؤهل عالي',
      spouse_job: 'تعمل',
      kinship: 'لا يوجد',
      chronic_disease: 'لا يوجد',
    },
    created_at: '2025-01-15T09:30:00.000Z',
    updated_at: '2025-01-15T09:30:00.000Z',
  },
  {
    id: 'cl000000-0000-0000-0000-000000000002',
    client_type: 'children',
    national_id: '29703120104321',
    full_name: 'مريم خالد مصطفى',
    phone: '01187654321',
    spouse_name: 'حسام الدين طارق',
    spouse_national_id: '29502010108765',
    spouse_phone: '01199887766',
    meta: {
      child_name: 'يوسف حسام الدين',
      child_gender: 'ذكر',
      birth_date: '2024-10-15',
      birth_weight: '3.2',
    },
    created_at: '2025-01-20T10:15:00.000Z',
    updated_at: '2025-01-20T10:15:00.000Z',
  },
  {
    id: 'cl000000-0000-0000-0000-000000000003',
    client_type: 'pregnancy',
    national_id: '29608220109876',
    full_name: 'شيماء يحيى رضوان',
    phone: '01276543210',
    spouse_name: 'محمد إبراهيم حسنين',
    spouse_national_id: '29307150101234',
    spouse_phone: '01255443322',
    meta: {
      gravida: 2,
      para: 1,
      gestational_age_weeks: 24,
      blood_type: 'O+',
    },
    created_at: '2025-02-05T11:00:00.000Z',
    updated_at: '2025-02-05T11:00:00.000Z',
  },
  {
    id: 'cl000000-0000-0000-0000-000000000004',
    client_type: 'family_planning',
    national_id: '29402150107654',
    full_name: 'نادية سامي بركات',
    phone: '01565432109',
    spouse_name: 'عمرو كمال منصور',
    spouse_national_id: '29104100109876',
    spouse_phone: '01533221100',
    meta: {
      children_count: 2,
      last_delivery_date: '2024-11-01',
      previous_method: 'حبوب منع الحمل',
    },
    created_at: '2025-02-12T09:00:00.000Z',
    updated_at: '2025-02-12T09:00:00.000Z',
  },
  {
    id: 'cl000000-0000-0000-0000-000000000005',
    client_type: 'pre_marriage',
    national_id: '29909090103456',
    full_name: 'محمود عبد الرحمن خليل',
    phone: '01023456789',
    spouse_name: 'ياسمين عصام توفيق',
    spouse_national_id: '30002020107890',
    spouse_phone: '01066778899',
    meta: {
      partner_age: 26,
      partner_education: 'مؤهل عالي',
      spouse_age: 24,
    },
    created_at: '2025-02-25T12:00:00.000Z',
    updated_at: '2025-02-25T12:00:00.000Z',
  },
];

// Initial seed visits
const INITIAL_VISITS: Visit[] = [
  {
    id: 'v0000000-0000-0000-0000-000000000001',
    visit_type: 'pre_marriage',
    client_id: 'cl000000-0000-0000-0000-000000000001',
    counselor_id: 'c0000000-0000-0000-0000-000000000001',
    governorate: 'القاهرة',
    governorate_mfl: 'EG-C',
    district: 'مصر القديمة',
    district_mfl: 'DST-101',
    health_facility: 'مركز صحة الأسرة بمصر القديمة',
    health_facility_mfl: 'HF-2041',
    counselor_name: 'د. سارة محمود أحمد',
    counselor_phone: '01012345678',
    first_visit_date: '2025-01-15',
    case_number: 'PM-2025-001',
    session_number: 'الأول',
    visit_date: '2025-01-15',
    data: {
      partner_name: 'أحمد كريم الشافعي',
      partner_age: 27,
      partner_education: 'مؤهل عالي',
      partner_job: 'يعمل',
      partner_national_id: '29801010102345',
      partner_phone: '01098765432',
      spouse_name: 'نورهان عادل عبد المنعم',
      spouse_age: 25,
      spouse_education: 'مؤهل عالي',
      spouse_job: 'تعمل',
      spouse_national_id: '29905050106789',
      spouse_phone: '01011223344',
      kinship: 'لا يوجد',
      chronic_disease: 'لا يوجد',
      family_history: 'لا يوجد',
      independent_housing: 'يوجد',
    },
    notes: 'تم تقديم المشورة وتوضيح أهمية الفحوصات الجينية وفحوصات الأمراض المعدية، وتوضيح أهداف مبادرة الألف يوم الذهبية.',
    created_at: '2025-01-15T09:45:00.000Z',
    updated_at: '2025-01-15T09:45:00.000Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000002',
    visit_type: 'children',
    client_id: 'cl000000-0000-0000-0000-000000000002',
    counselor_id: 'c0000000-0000-0000-0000-000000000003',
    governorate: 'الجيزة',
    governorate_mfl: 'EG-GZ',
    district: 'الدقي',
    district_mfl: 'DST-201',
    health_facility: 'وحدة صحة الدقي',
    health_facility_mfl: 'HF-1102',
    counselor_name: 'أ. فاطمة إبراهيم علي',
    counselor_phone: '01234567890',
    first_visit_date: '2024-11-01',
    case_number: 'CH-2025-014',
    session_number: 'الثاني',
    visit_date: '2025-01-20',
    data: {
      mother_name: 'مريم خالد مصطفى',
      mother_national_id: '29703120104321',
      mother_phone: '01187654321',
      child_name: 'يوسف حسام الدين',
      age_months: 3,
      breastfeeding_type: 'رضاعة طبيعية مطلقة',
      weight_kg: '5.8',
      height_cm: '61',
    },
    notes: 'الطفل بحالة ممتازة والنمو مطابق لمنحنيات منظمة الصحة العالمية. تم التأكيد على الاستمرار في الرضاعة المطلقة حتى عمر 6 أشهر.',
    created_at: '2025-01-20T10:30:00.000Z',
    updated_at: '2025-01-20T10:30:00.000Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000003',
    visit_type: 'pregnancy',
    client_id: 'cl000000-0000-0000-0000-000000000003',
    counselor_id: 'c0000000-0000-0000-0000-000000000002',
    governorate: 'القاهرة',
    governorate_mfl: 'EG-C',
    district: 'مصر الجديدة',
    district_mfl: 'DST-104',
    health_facility: 'مركز رعاية طفل مصر الجديدة',
    health_facility_mfl: 'HF-3005',
    counselor_name: 'د. منى عبد الفتاح السيد',
    counselor_phone: '01123456789',
    first_visit_date: '2024-12-10',
    case_number: 'PR-2025-028',
    session_number: 'الثالث',
    visit_date: '2025-02-05',
    data: {
      client_name: 'شيماء يحيى رضوان',
      client_national_id: '29608220109876',
      client_phone: '01276543210',
      gestational_week: 24,
      blood_pressure: '115/75',
      hb_level: '11.4',
      supplements: 'حديد + فوليك أسيد + كالسيوم',
    },
    notes: 'الحمل مستقر وضغط الدم طبيعي. تم شرح علامات الخطر وأهمية التحضير للولادة الطبيعية ومزايا التلامس الجلدي المبكر.',
    created_at: '2025-02-05T11:20:00.000Z',
    updated_at: '2025-02-05T11:20:00.000Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000004',
    visit_type: 'family_planning',
    client_id: 'cl000000-0000-0000-0000-000000000004',
    counselor_id: 'c0000000-0000-0000-0000-000000000001',
    governorate: 'القاهرة',
    governorate_mfl: 'EG-C',
    district: 'مصر القديمة',
    district_mfl: 'DST-101',
    health_facility: 'مركز صحة الأسرة بمصر القديمة',
    health_facility_mfl: 'HF-2041',
    counselor_name: 'د. سارة محمود أحمد',
    counselor_phone: '01012345678',
    first_visit_date: '2025-02-12',
    case_number: 'FP-2025-009',
    session_number: 'الأول',
    visit_date: '2025-02-12',
    data: {
      client_name: 'نادية سامي بركات',
      client_national_id: '29402150107654',
      client_phone: '01565432109',
      selected_method: 'اللولب النحاسي',
      method_timing: 'بعد الأربعين',
      side_effects_explained: 'نعم',
    },
    notes: 'تمت المشورة بناءً على نموذج الرعاية المشتركة وتم اختيار وسيلة طويلة المفعول ومناسبة للرضاعة الطبيعية.',
    created_at: '2025-02-12T09:30:00.000Z',
    updated_at: '2025-02-12T09:30:00.000Z',
  },
  {
    id: 'v0000000-0000-0000-0000-000000000005',
    visit_type: 'pre_marriage',
    client_id: 'cl000000-0000-0000-0000-000000000005',
    counselor_id: 'c0000000-0000-0000-0000-000000000004',
    governorate: 'القاهرة',
    governorate_mfl: 'EG-C',
    district: 'مصر القديمة',
    district_mfl: 'DST-101',
    health_facility: 'مركز صحة الأسرة بمصر القديمة',
    health_facility_mfl: 'HF-2041',
    counselor_name: 'أ. هدى حسن عبد الله',
    counselor_phone: '01545678901',
    first_visit_date: '2025-02-25',
    case_number: 'PM-2025-033',
    session_number: 'الأول',
    visit_date: '2025-02-25',
    data: {
      partner_name: 'محمود عبد الرحمن خليل',
      partner_national_id: '29909090103456',
      partner_phone: '01023456789',
      spouse_name: 'ياسمين عصام توفيق',
      spouse_national_id: '30002020107890',
      spouse_phone: '01066778899',
    },
    notes: 'تمت جلسة المشورة الأولى بنجاح وجاري استكمال الفحوصات المعملية.',
    created_at: '2025-02-25T12:30:00.000Z',
    updated_at: '2025-02-25T12:30:00.000Z',
  },
];

interface MockStorage {
  counselors: Counselor[];
  clients: Client[];
  visits: Visit[];
}

// Global in-memory storage to survive across requests in development server
declare global {
  // eslint-disable-next-line no-var
  var __counselingMockDb: MockStorage | undefined;
}

function getStorage(): MockStorage {
  if (!globalThis.__counselingMockDb) {
    globalThis.__counselingMockDb = {
      counselors: JSON.parse(JSON.stringify(INITIAL_COUNSELORS)),
      clients: JSON.parse(JSON.stringify(INITIAL_CLIENTS)),
      visits: JSON.parse(JSON.stringify(INITIAL_VISITS)),
    };
  }
  return globalThis.__counselingMockDb;
}

export const mockDb = {
  getCounselors(includeInactive = false): Counselor[] {
    const list = getStorage().counselors;
    return includeInactive ? list : list.filter((c) => c.is_active);
  },
  getCounselor(id: string): Counselor | null {
    return getStorage().counselors.find((c) => c.id === id) || null;
  },
  getCounselorByUserId(userId: string): Counselor | null {
    return getStorage().counselors.find((c) => c.user_id === userId) || null;
  },
  createCounselor(input: Partial<Counselor>): Counselor {
    const id = input.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const counselor: Counselor = {
      id,
      user_id: input.user_id ?? null,
      full_name: input.full_name || 'مدخل جديد',
      national_id: input.national_id ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      employee_code: input.employee_code ?? null,
      specialty: input.specialty ?? null,
      work_days: input.work_days ?? null,
      trainings: input.trainings ?? null,
      is_active: input.is_active ?? true,
      is_admin: input.is_admin ?? false,
      created_at: now,
      updated_at: now,
    };
    getStorage().counselors.unshift(counselor);
    return counselor;
  },
  updateCounselor(id: string, input: Partial<Counselor>): Counselor {
    const list = getStorage().counselors;
    const idx = list.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error('Counselor not found');
    const updated = {
      ...list[idx],
      ...input,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    return updated;
  },
  deleteCounselor(id: string): void {
    const store = getStorage();
    store.counselors = store.counselors.filter((c) => c.id !== id);
  },

  // Clients
  getClients(type?: VisitType): Client[] {
    const list = getStorage().clients;
    return type ? list.filter((c) => c.client_type === type) : list;
  },
  getClient(id: string): Client | null {
    return getStorage().clients.find((c) => c.id === id) || null;
  },
  findClientByNationalId(type: VisitType, nationalId: string): Client | null {
    return (
      getStorage().clients.find(
        (c) => c.client_type === type && c.national_id === nationalId
      ) || null
    );
  },
  searchClients(type: VisitType, query: string): Client[] {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    const isDigits = /^\d+$/.test(q);
    return getStorage().clients
      .filter((c) => {
        if (c.client_type !== type) return false;
        if (isDigits) {
          return c.national_id.includes(q) || (c.phone && c.phone.includes(q));
        }
        return c.full_name.toLowerCase().includes(q);
      })
      .slice(0, 20);
  },
  upsertClient(client: Partial<Client> & { client_type: VisitType; national_id: string; full_name: string }): Client {
    const existing = this.findClientByNationalId(client.client_type, client.national_id);
    const now = new Date().toISOString();
    if (existing) {
      Object.assign(existing, {
        full_name: client.full_name,
        phone: client.phone ?? existing.phone,
        spouse_name: client.spouse_name ?? existing.spouse_name,
        spouse_national_id: client.spouse_national_id ?? existing.spouse_national_id,
        spouse_phone: client.spouse_phone ?? existing.spouse_phone,
        meta: { ...existing.meta, ...(client.meta || {}) },
        updated_at: now,
      });
      return existing;
    }
    const newClient: Client = {
      id: client.id || crypto.randomUUID(),
      client_type: client.client_type,
      national_id: client.national_id,
      full_name: client.full_name,
      phone: client.phone ?? null,
      spouse_name: client.spouse_name ?? null,
      spouse_national_id: client.spouse_national_id ?? null,
      spouse_phone: client.spouse_phone ?? null,
      meta: client.meta ?? {},
      created_at: now,
      updated_at: now,
    };
    getStorage().clients.unshift(newClient);
    return newClient;
  },

  // Visits
  getVisits(): Visit[] {
    return getStorage().visits;
  },
  getVisitWithRelations(id: string): VisitWithRelations | null {
    const v = getStorage().visits.find((x) => x.id === id);
    if (!v) return null;
    return {
      ...v,
      client: this.getClient(v.client_id) || undefined,
      counselor: v.counselor_id ? this.getCounselor(v.counselor_id) || undefined : undefined,
    };
  },
  createVisit(input: Partial<Visit> & { visit_type: VisitType; client_id: string }): Visit {
    const id = input.id || crypto.randomUUID();
    const now = new Date().toISOString();
    const visit: Visit = {
      id,
      visit_type: input.visit_type,
      client_id: input.client_id,
      counselor_id: input.counselor_id ?? null,
      governorate: input.governorate ?? null,
      governorate_mfl: input.governorate_mfl ?? null,
      district: input.district ?? null,
      district_mfl: input.district_mfl ?? null,
      health_facility: input.health_facility ?? null,
      health_facility_mfl: input.health_facility_mfl ?? null,
      counselor_name: input.counselor_name ?? null,
      counselor_phone: input.counselor_phone ?? null,
      first_visit_date: input.first_visit_date ?? null,
      case_number: input.case_number ?? null,
      session_number: input.session_number ?? null,
      visit_date: input.visit_date ?? null,
      data: input.data ?? {},
      notes: input.notes ?? null,
      created_at: now,
      updated_at: now,
    };
    getStorage().visits.unshift(visit);
    return visit;
  },
  updateVisit(id: string, input: Partial<Visit>): Visit {
    const list = getStorage().visits;
    const idx = list.findIndex((v) => v.id === id);
    if (idx === -1) throw new Error('Visit not found');
    const updated = {
      ...list[idx],
      ...input,
      updated_at: new Date().toISOString(),
    };
    list[idx] = updated;
    return updated;
  },
  deleteVisit(id: string): void {
    const store = getStorage();
    store.visits = store.visits.filter((v) => v.id !== id);
  },
};
