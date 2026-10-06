// app/lib/types.ts
// =====================================================================
// Domain types for the counseling data entry system
// ---------------------------------------------------------------------
// All sheet / column metadata now lives in `column-registry.ts`.
// This file only re-exports the registry types and adds the DB row
// shapes that are not derived from the registry.
// =====================================================================

import type {
  ColumnDef,
  ColumnSource,
  FieldType,
  SheetLayout,
  VisitType,
} from './column-registry';
import {
  VISIT_TYPES,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_SHORT,
  VISIT_TYPE_SHEET_NAME,
  PRIMARY_NID_KEY,
  PHONE_KEY,
  CLIENT_NAME_KEY,
  SHEET_LAYOUTS,
  buildDataPayload,
  buildVisitRow,
  colIndexToLetter,
  dataColumns,
  detectVisitTypeFromSheetName,
  normaliseValue,
  parseFlexibleDate,
  visitColumns,
} from './column-registry';

export {
  VISIT_TYPES,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_SHORT,
  VISIT_TYPE_SHEET_NAME,
  PRIMARY_NID_KEY,
  PHONE_KEY,
  CLIENT_NAME_KEY,
  SHEET_LAYOUTS,
  buildDataPayload,
  buildVisitRow,
  colIndexToLetter,
  dataColumns,
  detectVisitTypeFromSheetName,
  normaliseValue,
  parseFlexibleDate,
  visitColumns,
};

export type {
  ColumnDef,
  ColumnSource,
  FieldType,
  SheetLayout,
  VisitType,
};

// =====================================================================
// Backward-compat aliases
// =====================================================================
// The original types.ts had its own `FieldDef` interface; the rest of the
// app (FieldInput, VisitForm, etc.) still imports it.  It's structurally
// the same as `ColumnDef` (the canonical name in the registry).
export type FieldDef = ColumnDef;

// =====================================================================
// Form schema (derived from the registry)
// =====================================================================
// The form renderer (VisitForm.tsx) used to read hard-coded SCHEMAS.
// It still expects the same shape, so we project from the registry.

export interface FormSchema {
  type: VisitType;
  title: string;
  sections: { id: string; title: string }[];
  fields: ColumnDef[];
}

const SECTION_LABELS_AR: Record<string, string> = {
  partner_male: 'بيانات الشريك',
  partner_female: 'بيانات الشريكة',
  mother: 'بيانات الأم',
  father: 'بيانات الأب',
  child: 'بيانات الطفل',
  client: 'بيانات الحالة',
  background: 'الخلفية الصحية والاجتماعية',
  supplements: 'المكملات الغذائية',
  fp_history: 'تاريخ وسيلة تنظيم الأسرة',
  session: 'بيانات الزيارة',
  feeding: 'الرضاعة الحالية',
  growth: 'قياسات النمو',
  topics: 'الموضوعات التي تم تناولها',
  closing: 'التخطيط والملاحظات',
};

function buildSchema(type: VisitType): FormSchema {
  const layout = SHEET_LAYOUTS[type];
  const fields = dataColumns(type).filter((c) => !!c.section);
  // Derive section list from fields, preserve the order of first appearance
  const seen = new Set<string>();
  const sections: { id: string; title: string }[] = [];
  for (const f of fields) {
    const id = f.section!;
    if (!seen.has(id)) {
      seen.add(id);
      sections.push({ id, title: SECTION_LABELS_AR[id] ?? id });
    }
  }
  return { type, title: layout.title, sections, fields };
}

export const SCHEMAS: Record<VisitType, FormSchema> = {
  pre_marriage: buildSchema('pre_marriage'),
  children: buildSchema('children'),
  pregnancy: buildSchema('pregnancy'),
  family_planning: buildSchema('family_planning'),
};

// =====================================================================
// Excel export column order — derived from the registry
// =====================================================================
export interface ExcelCell {
  key: string;
  label: string;
  from: 'client' | 'visit' | 'data';
}

export const EXCEL_COLUMNS: Record<VisitType, ExcelCell[]> = {
  pre_marriage: SHEET_LAYOUTS.pre_marriage.columns.map((c) => ({
    key: c.key,
    label: c.label,
    from: c.from === 'client' ? 'client' : c.from,
  })),
  children: SHEET_LAYOUTS.children.columns.map((c) => ({
    key: c.key,
    label: c.label,
    from: c.from === 'client' ? 'client' : c.from,
  })),
  pregnancy: SHEET_LAYOUTS.pregnancy.columns.map((c) => ({
    key: c.key,
    label: c.label,
    from: c.from === 'client' ? 'client' : c.from,
  })),
  family_planning: SHEET_LAYOUTS.family_planning.columns.map((c) => ({
    key: c.key,
    label: c.label,
    from: c.from === 'client' ? 'client' : c.from,
  })),
};

// =====================================================================
// DB row shapes
// =====================================================================
export interface Counselor {
  id: string;
  user_id: string | null;
  full_name: string;
  national_id: string | null;
  phone: string | null;
  email: string | null;
  employee_code: string | null;
  specialty: string | null;
  work_days: string | null;
  trainings: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Client {
  id: string;
  client_type: VisitType;
  national_id: string;
  full_name: string;
  phone: string | null;
  spouse_name: string | null;
  spouse_national_id: string | null;
  spouse_phone: string | null;
  meta: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface Visit {
  id: string;
  visit_type: VisitType;
  client_id: string;
  counselor_id: string | null;
  governorate: string | null;
  governorate_mfl: string | null;
  district: string | null;
  district_mfl: string | null;
  health_facility: string | null;
  health_facility_mfl: string | null;
  counselor_name: string | null;
  counselor_phone: string | null;
  first_visit_date: string | null;
  case_number: string | null;
  session_number: string | null;
  visit_date: string | null;
  data: Record<string, unknown>;
  notes: string | null;
  /** 'manual' | 'imported' | 'bulk' — see 001_schema.sql.  Optional
   *  for backward-compat with seed data; the DB has `default 'manual'`. */
  source?: string;
  created_at: string;
  updated_at: string;
}

export interface VisitWithRelations extends Visit {
  client?: Client;
  counselor?: Counselor | null;
}