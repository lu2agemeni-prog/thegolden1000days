import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { EXCEL_COLUMNS, type VisitType } from '@/lib/types';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || '54321';

const VISIT_FIELDS_FROM_DATA: Record<VisitType, string> = {
  pre_marriage: 'partner_name',
  children: 'mother_name',
  pregnancy: 'client_name',
  family_planning: 'client_name',
};

const VISIT_FIELDS_NID: Record<VisitType, string> = {
  pre_marriage: 'partner_national_id',
  children: 'mother_national_id',
  pregnancy: 'client_national_id',
  family_planning: 'client_national_id',
};

const VISIT_FIELDS_PHONE: Record<VisitType, string> = {
  pre_marriage: 'partner_phone',
  children: 'mother_phone',
  pregnancy: 'client_phone',
  family_planning: 'client_phone',
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Defense in depth — the upload page also gates the UI with this password
    if (body.password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }

    const {
      visit_type,
      national_id,
      full_name,
      counselor_id,
      raw_row,
      data,
    } = body as {
      visit_type: VisitType;
      national_id: string | null;
      full_name: string | null;
      counselor_id: string;
      raw_row: Record<string, string | number>;
      data: Record<string, string | number>;
    };

    if (!visit_type || !counselor_id) {
      return NextResponse.json(
        { error: 'visit_type and counselor_id required' },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Find or create client
    let clientId: string | null = null;
    if (national_id && national_id.length === 14) {
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('client_type', visit_type)
        .eq('national_id', national_id)
        .maybeSingle();

      if (existing) {
        clientId = existing.id;
        await supabase
          .from('clients')
          .update({
            full_name: full_name ?? undefined,
            phone: data[VISIT_FIELDS_PHONE[visit_type]] as string ?? null,
          })
          .eq('id', clientId);
      } else {
        const { data: inserted, error: insErr } = await supabase
          .from('clients')
          .insert({
            client_type: visit_type,
            national_id,
            full_name: full_name ?? '(بدون اسم)',
            phone: (data[VISIT_FIELDS_PHONE[visit_type]] as string) ?? null,
            meta: data,
          })
          .select('id')
          .single();
        if (insErr) throw insErr;
        clientId = inserted!.id;
      }
    } else {
      // No national id — create a unique one with timestamp
      const syntheticNid = `0000${Date.now().toString().slice(-10)}`;
      const { data: inserted, error: insErr } = await supabase
        .from('clients')
        .insert({
          client_type: visit_type,
          national_id: syntheticNid,
          full_name: full_name ?? '(بدون اسم)',
          phone: (data[VISIT_FIELDS_PHONE[visit_type]] as string) ?? null,
          meta: data,
        })
        .select('id')
        .single();
      if (insErr) throw insErr;
      clientId = inserted!.id;
    }

    // Build the visit payload
    const visitPayload: Record<string, unknown> = {
      visit_type,
      client_id: clientId,
      counselor_id,
    };

    EXCEL_COLUMNS[visit_type].forEach((col) => {
      if (col.from === 'visit') {
        const v = raw_row[col.key];
        if (v !== undefined && v !== null && v !== '') {
          let mapped: any = v;
          if (col.key === 'first_visit_date' || col.key === 'session_date') {
            // try to parse dates
            try {
              const d = new Date(String(v));
              if (!isNaN(d.getTime())) mapped = d.toISOString().slice(0, 10);
            } catch {}
          }
          visitPayload[col.key] = mapped;
        }
      }
    });

    visitPayload.data = data;
    visitPayload.notes = null;

    const { data: created, error: visErr } = await supabase
      .from('visits')
      .insert(visitPayload)
      .select('id')
      .single();
    if (visErr) throw visErr;

    return NextResponse.json({ ok: true, id: created!.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}