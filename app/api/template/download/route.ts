import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { EXCEL_COLUMNS, type VisitType } from '@/lib/types';

// Generates a sample Excel workbook with one sheet per counseling type, with
// the exact column layout used by the production upload pipeline.  Users can
// download this and use it as a template to format their own legacy data.

const SHEET_TITLES: Record<VisitType, string> = {
  pre_marriage: 'سجل مشورة ما قبل الزواج',
  children: 'سجل المشورة للاطفال',
  pregnancy: 'المشوره الاسريه للحامل',
  family_planning: 'المشوره الاسريه لتنظيم الاسرة',
};

const SAMPLE_INTRO_NOTE = 'هذه عينة - احذف الصفوف قبل إدخال بياناتك الحقيقية';

// ---- Sample rows (one or two per sheet, all fake / clearly marked) -------

const SAMPLE_PRE_MARRIAGE = {
  // Common header
  row_no: 1,
  governorate: 'القاهرة',
  governorate_mfl: '',
  district: 'مدينة نصر',
  district_mfl: '',
  health_facility: 'مركز صحة الأسرة - مدينة نصر',
  health_facility_mfl: '',
  counselor_name: 'مقدمة المشورة - عينة',
  counselor_phone: '01000000000',
  first_visit_date: '2025-01-15',
  case_number: 'CASE-001',
  // Partner (husband)
  partner_name: 'عينة - أحمد',
  partner_age: 30,
  partner_education: 'مؤهل عالي',
  partner_job: 'يعمل',
  partner_national_id: '30001011234567',
  partner_phone: '01012345678',
  // Spouse (wife)
  spouse_name: 'عينة - سارة',
  spouse_age: 26,
  spouse_education: 'مؤهل عالي',
  spouse_job: 'لا تعمل',
  spouse_national_id: '29901019876543',
  spouse_phone: '01098765432',
  kinship: 'لا يوجد',
  chronic_disease: 'لا يوجد',
  family_history: 'لا يوجد',
  independent_housing: 'يوجد',
  children_from_previous: 'لا يوجد',
  session_number: 'الأول',
  session_date: '2025-01-15',
  topic_intro_screening: 'تم',
  topic_partner_choice: 'تم',
  topic_pre_marriage_rec: 'تم',
  topic_intimacy: 'تم',
  topic_family_planning: 'تم',
  topic_conflict_skills: 'لم يتم',
  topic_finance: 'تم',
  topic_family_problems: 'لم يتم',
  topic_healthy_lifestyle: 'تم',
  topic_repro_health: 'تم',
  topic_diabetes: 'لم يتم',
  topic_hypertension: 'لم يتم',
  topic_psych_pressure: 'لم يتم',
  topic_female_psych: 'لم يتم',
  topic_hepatitis_c: 'لم يتم',
  topic_hepatitis_b: 'لم يتم',
  topic_hiv: 'لم يتم',
  topic_rhesus: 'تم',
  topic_genetic_counsel: 'لم يتم',
  topic_parenthood: 'تم',
  topic_natural_birth: 'تم',
  topic_birth_spacing: 'تم',
  topic_other: 'موضوعات عينة',
};

const SAMPLE_CHILDREN = {
  row_no: 1,
  governorate: 'الإسكندرية',
  governorate_mfl: '',
  district: 'سموحة',
  district_mfl: '',
  health_facility: 'وحدة صحة الأسرة - سموحة',
  health_facility_mfl: '',
  counselor_name: 'مقدمة المشورة - عينة',
  counselor_phone: '01000000000',
  first_visit_date: '2025-02-10',
  mother_name: 'عينة - هاجر',
  mother_national_id: '28802021234567',
  mother_phone: '01112345678',
  mother_birth_date: '1988-02-02',
  mother_education: 'مؤهل عالي',
  mother_children_count: 2,
  mother_last_gap: 24,
  mother_job: 'لا تعمل',
  father_national_id: '28603031234567',
  father_phone: '01212345678',
  father_name: 'عينة - محمود',
  father_education: 'مؤهل عالي',
  child_name: 'عينة - ليلى',
  child_birth_date: '2024-12-01',
  child_age_months: 2,
  child_gestational_age: 39,
  follow_up_place: 'وحدة',
  referral_source: 'مستشفى الولادة',
  delivery_type: 'طبيعى',
  delivery_place: 'المستشفى',
  birth_weight: '3.2 كجم',
  birth_length: '50 سم',
  birth_head_circ: '35 سم',
  nicu_admission: 'لا',
  nicu_reason: '',
  nicu_duration_days: '',
  skin_to_skin: 'نعم',
  bf_golden_hour: 'نعم',
  session_number: 'الأسبوع الأول',
  session_date: '2025-02-10',
  feeding_type: 'رضاعة طبيعية مطلقة',
  feeding_duration: '3 شهور',
  weight_kg: 4.5,
  length_cm: 53,
  head_circumference_cm: 37,
  topic_bf_basics: 'تم',
  topic_milk_amount: 'تم',
  topic_vitamin_d: 'تم',
  topic_cord_care: 'تم',
  topic_health_card: 'تم',
  topic_vaccination: 'تم',
  topic_mother_nutrition: 'تم',
  topic_danger_signs: 'تم',
  topic_growth_motor: 'تم',
  topic_growth_cognitive: 'لم يتم',
  topic_growth_language: 'لم يتم',
  topic_positive_parenting: 'تم',
  topic_stimulating: 'لم يتم',
  topic_complementary: 'لم يتم',
  topic_iron_dose: 'لم يتم',
  topic_fp_use: 'تم',
  fp_attitude: 'لا يوجد',
  new_pregnancy: 'غير مرغوب',
  unmet_services: 'تم',
  notes: 'عينة - ملاحظات',
  next_visit_plan: 'عينة - بعد شهر',
};

const SAMPLE_PREGNANCY = {
  row_no: 1,
  governorate: 'الجيزة',
  governorate_mfl: '',
  district: 'الدقي',
  district_mfl: '',
  health_facility: 'مركز صحة الأم والطفل - الدقي',
  health_facility_mfl: '',
  counselor_name: 'مقدمة المشورة - عينة',
  counselor_phone: '01000000000',
  first_visit_date: '2025-03-05',
  case_number: 'CASE-P-001',
  client_name: 'عينة - منى',
  client_address: 'الدقي - الجيزة',
  client_national_id: '29005051234567',
  client_phone: '01298765432',
  client_age: 35,
  age_at_marriage: 25,
  age_at_first_pregnancy: 27,
  client_education: 'مؤهل عالي',
  client_job: 'لا تعمل',
  last_menstrual_date: '2024-10-10',
  spouse_kinship: 'لا يوجد',
  pregnancy_count: 2,
  miscarriage_count: 0,
  children_count: 1,
  last_pregnancy_gap: 36,
  previous_delivery_type: 'طبيعى',
  chronic_hypertension: 'لا يوجد',
  chronic_diabetes: 'لا يوجد',
  chronic_thyroid: 'لا يوجد',
  chronic_anemia: 'لا يوجد',
  chronic_other: '',
  supp_before_folic: 'يوجد',
  supp_before_iron: 'يوجد',
  supp_before_calcium: 'يوجد',
  supp_during_folic: 'يوجد',
  supp_during_iron: 'يوجد',
  supp_during_calcium: 'يوجد',
  previous_fp_method: 'لا يوجد',
  previous_fp_duration: '',
  pregnancy_month: 'الخامس',
  session_date: '2025-03-05',
  topic_nutrition: 'تم',
  topic_supp: 'تم',
  topic_exercise: 'تم',
  topic_rest: 'تم',
  topic_anc: 'تم',
  topic_medication_warning: 'تم',
  topic_early_discomfort: 'تم',
  topic_late_discomfort: 'لم يتم',
  topic_danger_signs: 'تم',
  topic_preterm: 'تم',
  topic_fetal_movement: 'تم',
  topic_breast_changes: 'لم يتم',
  topic_clothes: 'تم',
  topic_birth_prep: 'لم يتم',
  topic_birth_signs: 'لم يتم',
  topic_natural_birth: 'تم',
  topic_golden_hour: 'تم',
  topic_skin_to_skin: 'تم',
  topic_early_bf: 'تم',
  topic_exclusive_bf: 'تم',
  topic_spacing: 'تم',
  topic_fp_methods: 'تم',
  topic_fp_after_birth: 'تم',
  topic_neuro_dev: 'لم يتم',
  notes: 'عينة - ملاحظات',
  next_visit_plan: 'عينة - بعد أسبوعين',
  postnatal_followup: 'عينة - بعد شهر من الولادة',
};

const SAMPLE_FAMILY_PLANNING = {
  row_no: 1,
  governorate: 'القاهرة',
  governorate_mfl: '',
  district: 'مصر الجديدة',
  district_mfl: '',
  health_facility: 'وحدة تنظيم الأسرة - مصر الجديدة',
  health_facility_mfl: '',
  counselor_name: 'مقدمة المشورة - عينة',
  counselor_phone: '01000000000',
  first_visit_date: '2025-04-12',
  case_number: 'CASE-FP-001',
  client_name: 'عينة - إيمان',
  client_address: 'مصر الجديدة',
  client_national_id: '28507071234567',
  client_phone: '01512345678',
  client_age: 40,
  age_at_marriage: 23,
  age_at_first_pregnancy: 25,
  client_education: 'مؤهل متوسط',
  client_job: 'تعمل',
  last_menstrual_date: '2025-04-01',
  spouse_kinship: 'لا يوجد',
  pregnancy_count: 3,
  miscarriage_count: 0,
  children_count: 3,
  last_pregnancy_gap: 30,
  chronic_hypertension: 'لا يوجد',
  chronic_diabetes: 'لا يوجد',
  chronic_thyroid: 'لا يوجد',
  chronic_anemia: 'لا يوجد',
  chronic_other: '',
  previous_fp_method: 'اقراص',
  previous_fp_duration: 'سنتين',
  session_date: '2025-04-12',
  topic_spacing: 'تم',
  topic_fp_methods: 'تم',
  topic_fp_after_birth: 'تم',
  notes: 'عينة - ملاحظات',
  next_visit_plan: 'عينة - بعد 3 شهور',
};

const SAMPLE_BY_TYPE: Record<VisitType, Record<string, unknown>> = {
  pre_marriage: SAMPLE_PRE_MARRIAGE,
  children: SAMPLE_CHILDREN,
  pregnancy: SAMPLE_PREGNANCY,
  family_planning: SAMPLE_FAMILY_PLANNING,
};

// Build a worksheet that mirrors the original Excel layout:
//   Row 1: big title
//   Row 2: empty / note
//   Row 3: section / column labels
//   Row 4-5: sub-labels / hints
//   Row 6+: data
function buildSheet(type: VisitType): unknown[][] {
  const cols = EXCEL_COLUMNS[type];
  const sample = SAMPLE_BY_TYPE[type];

  // Title row
  const aoa: unknown[][] = [[SHEET_TITLES[type]], [SAMPLE_INTRO_NOTE]];

  // Header row matching the real Excel (column labels in Arabic)
  aoa.push(cols.map((c) => c.label));

  // One sample row, blank cells where the schema has no sample value
  aoa.push(cols.map((c) => (sample[c.key] !== undefined ? sample[c.key] : '')));

  return aoa;
}

export async function GET() {
  try {
    const wb = XLSX.utils.book_new();

    (Object.keys(SHEET_TITLES) as VisitType[]).forEach((type) => {
      const aoa = buildSheet(type);
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Light styling: bold the header row (row index 2 in zero-based AOA)
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
      for (let c = range.s.c; c <= range.e.c; c++) {
        const addr = XLSX.utils.encode_cell({ r: 2, c });
        if (ws[addr]) ws[addr].s = { font: { bold: true } };
      }

      // Light column widths
      ws['!cols'] = EXCEL_COLUMNS[type].map((c) => ({
        wch: Math.min(Math.max(c.label.length + 2, 12), 40),
      }));

      XLSX.utils.book_append_sheet(wb, ws, SHEET_TITLES[type].slice(0, 31));
    });

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="counseling-upload-template.xlsx"',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}