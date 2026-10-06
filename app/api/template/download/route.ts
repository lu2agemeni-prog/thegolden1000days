// app/app/api/template/download/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import {
  EXCEL_COLUMNS,
  VISIT_TYPES,
  VISIT_TYPE_SHEET_NAME,
  type VisitType,
} from '@/lib/types';

export const dynamic = 'force-static';

/**
 * GET /api/template/download
 *
 * Builds a 4-sheet Excel template (one per visit type) using the
 * canonical column order from `lib/column-registry.ts`.  Each sheet
 * has a header row + a 1-row sample so the user can see the format.
 */
export async function GET() {
  try {
    const wb = XLSX.utils.book_new();

    for (const type of VISIT_TYPES as VisitType[]) {
      const cols = EXCEL_COLUMNS[type];
      const header = cols.map((c) => c.label);

      // 1-row sample so the user sees the exact format
      const sample = buildSampleRow(type);

      const aoa: unknown[][] = [header, sample];
      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      sheet['!cols'] = cols.map((c) => ({
        wch: Math.min(Math.max((c.label?.length || 10) + 2, 10), 40),
      }));
      sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(wb, sheet, VISIT_TYPE_SHEET_NAME[type].slice(0, 31));
    }

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition':
          'attachment; filename="1000-counseling-template.xlsx"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Sample rows for the template download.  Numbers in the sample so the
// user understands which column is which.
// ---------------------------------------------------------------------------
function buildSampleRow(type: VisitType): unknown[] {
  const cols = EXCEL_COLUMNS[type];
  const out: unknown[] = [];
  for (const c of cols) {
    const v = sampleValue(type, c.key);
    out.push(v === null || v === undefined ? '' : v);
  }
  return out;
}

function sampleValue(type: VisitType, key: string): string | number {
  if (key === 'row_no') return 1;
  if (key === 'governorate') return 'القاهرة';
  if (key === 'governorate_mfl') return 'EG-C';
  if (key === 'district') return 'مصر القديمة';
  if (key === 'district_mfl') return 'DST-101';
  if (key === 'health_facility') return 'مركز صحة الأسرة بمصر القديمة';
  if (key === 'health_facility_mfl') return 'HF-2041';
  if (key === 'counselor_phone' || key.endsWith('_phone')) return '01000000000';
  if (key === 'counselor_name') return 'اسم المدخل';
  if (key === 'first_visit_date') return '2025-01-15';
  if (key === 'session_date') return '2025-01-15';
  if (key === 'visit_date') return '2025-01-15';
  if (key === 'case_number') return 'CASE-0001';
  if (key === 'session_number') return 'الأول';
  if (key === 'pregnancy_month') return 'الأول';
  if (key === 'next_visit_plan' || key === 'notes' || key === 'postnatal_followup' || key === 'topic_other') return '';
  if (key.startsWith('topic_') || key === 'fp_attitude' || key === 'new_pregnancy' || key === 'unmet_services') return 'تم';
  if (key === 'chronic_hypertension' || key === 'chronic_diabetes' || key === 'chronic_thyroid' ||
      key === 'chronic_anemia' || key === 'chronic_other') return 'لا يوجد';
  if (key === 'kinship' || key === 'spouse_kinship') return 'لا يوجد';
  if (key === 'chronic_disease') return 'لا يوجد';
  if (key === 'family_history') return 'لا يوجد';
  if (key === 'independent_housing') return 'يوجد';
  if (key === 'children_from_previous') return 'لا يوجد';
  if (key.endsWith('_age') || key === 'client_age' || key === 'mother_children_count' ||
      key === 'mother_last_gap' || key === 'pregnancy_count' || key === 'miscarriage_count' ||
      key === 'children_count' || key === 'last_pregnancy_gap' || key === 'age_at_marriage' ||
      key === 'age_at_first_pregnancy' || key === 'child_age_months' ||
      key === 'child_gestational_age' || key === 'nicu_duration_days') return '25';
  if (key.endsWith('_national_id')) return '00000000000000';
  if (key === 'weight_kg') return '3.2';
  if (key === 'length_cm') return '50';
  if (key === 'head_circumference_cm') return '35';
  if (key.endsWith('_job') || key === 'client_job' || key === 'mother_job') return 'لا يعمل';
  if (key.endsWith('_education') || key === 'client_education' || key === 'father_education' ||
      key === 'mother_education') return 'مؤهل عالي';
  // Names
  if (key === 'partner_name' || key === 'spouse_name' || key === 'mother_name' ||
      key === 'father_name' || key === 'child_name' || key === 'client_name') return 'اسم تجريبي';
  if (key === 'child_birth_date' || key === 'mother_birth_date' || key === 'last_menstrual_date') return '2024-01-01';
  if (key === 'feeding_type') return 'رضاعة طبيعية مطلقة';
  if (key === 'feeding_duration') return '6 شهور';
  if (key === 'follow_up_place') return 'وحدة';
  if (key === 'referral_source') return 'مستشفى الولادة';
  if (key === 'delivery_type' || key === 'previous_delivery_type') return 'طبيعى';
  if (key === 'delivery_place') return 'المستشفى';
  if (key === 'nicu_admission') return 'لا';
  if (key === 'skin_to_skin' || key === 'bf_golden_hour') return 'نعم';
  if (key === 'previous_fp_method') return 'لا يوجد';
  if (key === 'previous_fp_duration') return '';
  if (key === 'supp_before_folic' || key === 'supp_before_iron' || key === 'supp_before_calcium' ||
      key === 'supp_during_folic' || key === 'supp_during_iron' || key === 'supp_during_calcium') return 'يوجد';
  if (key === 'client_address') return 'العنوان';
  if (key === 'topic_birth_spacing' || key === 'topic_spacing') return 'تم';
  if (key === 'topic_bf_basics') return 'تم';
  if (key === 'topic_vitamin_d') return 'تم';
  if (key === 'topic_cord_care') return 'تم';
  if (key === 'topic_vaccination') return 'تم';
  if (key === 'topic_mother_nutrition') return 'تم';
  if (key === 'topic_danger_signs') return 'تم';
  if (key === 'topic_positive_parenting') return 'تم';
  if (key === 'topic_stimulating') return 'تم';
  if (key === 'topic_complementary') return 'تم';
  if (key === 'topic_iron_dose') return 'تم';
  if (key === 'topic_fp_use') return 'تم';
  // Catch-all
  return '';
}