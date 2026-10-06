// app/app/api/upload/visit/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  buildDataPayload,
  buildVisitRow,
  parseFlexibleDate,
  PRIMARY_NID_KEY,
  PHONE_KEY,
  type VisitType,
} from '@/lib/column-registry';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || '54321';

interface UploadBody {
  visit_type: VisitType;
  national_id: string | null;
  full_name: string | null;
  counselor_id: string;
  raw_row: Record<string, unknown>;
  data: Record<string, unknown>;
  /** shared password for the bulk upload gate */
  password?: string;
  /** optional override; defaults to 'imported' */
  source?: 'manual' | 'imported' | 'bulk';
  /** optional: the row number in the source XLSX (for dedupe + audit) */
  sheet_row_no?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UploadBody;

    if (body.password && body.password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const {
      visit_type,
      national_id,
      full_name,
      counselor_id,
      raw_row = {},
      data: clientProvidedData,
      source = 'imported',
      sheet_row_no,
    } = body;

    if (!visit_type || !counselor_id) {
      return NextResponse.json(
        { error: 'visit_type and counselor_id required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // 1) Build the data payload from the raw row using the registry
    const dataPayload = clientProvidedData && Object.keys(clientProvidedData).length
      ? clientProvidedData
      : buildDataPayload(visit_type, raw_row);

    // 2) Resolve the primary NID — strip non-digits, then fallback to spouse NID
    const primaryNidKey = PRIMARY_NID_KEY[visit_type];
    const phoneKey = PHONE_KEY[visit_type];
    const primaryNid = (() => {
      const fromBody = (national_id ?? '').replace(/\D/g, '');
      if (fromBody && fromBody.length === 14) return fromBody;
      const fromData = (dataPayload[primaryNidKey] as string | undefined)?.replace(/\D/g, '') ?? '';
      if (fromData && fromData.length === 14) return fromData;
      // For pre_marriage, also accept the spouse NID so we don't lose rows
      if (visit_type === 'pre_marriage') {
        const spouse = (dataPayload['spouse_national_id'] as string | undefined)?.replace(/\D/g, '') ?? '';
        if (spouse && spouse.length === 14) return spouse;
      }
      return null;
    })();

    const phoneFromData = (dataPayload[phoneKey] as string | undefined) ?? null;

    // 3) Find or create the client row
    let clientId: string | null = null;
    if (primaryNid) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id, meta')
        .eq('client_type', visit_type)
        .eq('national_id', primaryNid)
        .maybeSingle();

      if (existing) {
        clientId = existing.id;
        await supabase
          .from('clients')
          .update({
            full_name: full_name ?? undefined,
            phone: phoneFromData ?? undefined,
            // Keep the rest of `data` as part of `meta` so search hits it
            meta: { ...(existing.meta as Record<string, unknown>), ...dataPayload },
          })
          .eq('id', clientId);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('clients')
          .insert({
            client_type: visit_type,
            national_id: primaryNid,
            full_name: full_name ?? '(بدون اسم)',
            phone: phoneFromData,
            meta: dataPayload,
          })
          .select('id')
          .single();
        if (insErr) throw insErr;
        clientId = inserted!.id;
      }
    } else {
      // No NID: fall back to a synthetic one so we can still store the visit
      const syntheticNid = `0000${Date.now().toString().slice(-10)}`;
      const { data: inserted, error: insErr } = await supabase
        .from('clients')
        .insert({
          client_type: visit_type,
          national_id: syntheticNid,
          full_name: full_name ?? '(بدون اسم)',
          phone: phoneFromData,
          meta: dataPayload,
        })
        .select('id')
        .single();
      if (insErr) throw insErr;
      clientId = inserted!.id;
    }

    // 4) Build the visit row from the registry
    const visitRow = buildVisitRow(visit_type, raw_row);
    // For pregnancy, the "session_number" column is the pregnancy month
    if (visit_type === 'pregnancy' && !visitRow.session_number && raw_row.pregnancy_month) {
      visitRow.session_number = String(raw_row.pregnancy_month).trim();
    }
    // For children, prefer session_date from the "session_date" key
    if (visit_type === 'children' && !visitRow.visit_date && raw_row.session_date) {
      visitRow.visit_date = parseFlexibleDate(String(raw_row.session_date));
    }

    // 5) Compute the dedupe signature: (visit_type, case_number, visit_date)
    // The DB has a unique index on this triple so re-imports become no-ops.
    const dedupeCaseNo = (visitRow.case_number as string | null) ?? null;
    const dedupeVisitDate = (visitRow.visit_date as string | null) ?? null;
    if (dedupeCaseNo && dedupeVisitDate) {
      const { data: dup } = await supabase
        .from('visits')
        .select('id')
        .eq('visit_type', visit_type)
        .eq('case_number', dedupeCaseNo)
        .eq('visit_date', dedupeVisitDate)
        .maybeSingle();
      if (dup) {
        return NextResponse.json({
          ok: true,
          id: dup.id,
          duplicate: true,
          message: 'الزيارة موجودة مسبقاً (تم تجاهلها)',
        });
      }
    }

    // 6) Insert the visit
    const { data: created, error: visErr } = await supabase
      .from('visits')
      .insert({
        visit_type,
        client_id: clientId,
        counselor_id: counselor_id || null,
        ...visitRow,
        data: dataPayload,
        source,
        sheet_row_no: sheet_row_no ?? null,
        imported_at: source === 'manual' ? null : new Date().toISOString(),
      })
      .select('id')
      .single();
    if (visErr) throw visErr;

    return NextResponse.json({ ok: true, id: created!.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}