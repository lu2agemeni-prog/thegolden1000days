// app/app/api/upload/bulk/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';
import {
  buildDataPayload,
  buildVisitRow,
  colIndexToLetter,
  detectVisitTypeFromSheetName,
  normaliseValue,
  parseFlexibleDate,
  PRIMARY_NID_KEY,
  PHONE_KEY,
  SHEET_LAYOUTS,
  VISIT_TYPE_SHEET_NAME,
  VISIT_TYPES,
  CLIENT_NAME_KEY,
  type ColumnDef,
  type VisitType,
} from '@/lib/column-registry';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || '54321';

// ---------------------------------------------------------------------------
// Arabic-aware header matcher.  Cleans common variants so the column mapping
// works even when the XLSX uses slightly different wording from the registry.
// ---------------------------------------------------------------------------
function cleanArabic(s: string): string {
  return (s || '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\s\u200f\u200e]+/g, ' ')
    .trim()
    .toLowerCase();
}

/** Map an XLSX sheet's columns → registry keys. Returns Map<letter, key>. */
function mapColumns(
  sheet: XLSX.WorkSheet,
  columns: ColumnDef[]
): Map<string, string> {
  const map = new Map<string, string>();
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  // Build a list of header cells (col letter → row1+row2+row3 text)
  const headers: { letter: string; text: string }[] = [];
  for (let C = range.s.c; C <= range.e.c; C++) {
    const letter = XLSX.utils.encode_col(C);
    const c1 = String(sheet[XLSX.utils.encode_cell({ r: 0, c: C })]?.v ?? '').trim();
    const c2 = String(sheet[XLSX.utils.encode_cell({ r: 1, c: C })]?.v ?? '').trim();
    const c3 = String(sheet[XLSX.utils.encode_cell({ r: 2, c: C })]?.v ?? '').trim();
    const combined = [c1, c2, c3].filter(Boolean).join(' ');
    headers.push({ letter, text: combined || c1 });
  }

  // 1) Positional match first (the file from the Ministry has fixed layout)
  columns.forEach((col, idx) => {
    const h = headers[idx];
    if (h) map.set(h.letter, col.key);
  });

  // 2) Fallback: fuzzy match for any column that wasn't placed positionally
  const usedLetters = new Set(map.keys());
  for (const col of columns) {
    if ([...map.values()].includes(col.key)) continue;
    const target = cleanArabic(col.label);
    for (const h of headers) {
      if (usedLetters.has(h.letter)) continue;
      const t = cleanArabic(h.text);
      if (t === target || (target.length > 4 && t.includes(target))) {
        map.set(h.letter, col.key);
        usedLetters.add(h.letter);
        break;
      }
    }
  }
  return map;
}

/** Find the first data row in the sheet (the row that contains "1" in col A or a 14-digit NID). */
function detectDataStart(sheet: XLSX.WorkSheet): number {
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  for (let R = 3; R <= Math.min(range.e.r + 1, 12); R++) {
    const cellA = sheet[XLSX.utils.encode_cell({ r: R, c: 0 })]?.v;
    if (cellA === 1 || cellA === '1' || cellA === '1.0') return R + 1; // 1-indexed
    for (let C = 0; C <= Math.min(range.e.c, 30); C++) {
      const v = String(sheet[XLSX.utils.encode_cell({ r: R, c: C })]?.v ?? '').replace(/\D/g, '');
      if (v.length === 14) return R + 1;
    }
  }
  return 4; // default to row 4
}

interface BulkSummary {
  visit_type: VisitType;
  parsed: number;
  inserted: number;
  duplicates: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

export async function POST(req: Request) {
  const t0 = Date.now();
  try {
    const body = (await req.json()) as {
      password?: string;
      counselor_id: string;
      fileBase64?: string;       // base64-encoded .xlsx
      source?: 'imported' | 'bulk';
      sheetName?: string;        // optional: only process this sheet (debug)
    };

    if (body.password !== UPLOAD_PASSWORD) {
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }
    if (!body.counselor_id) {
      return NextResponse.json({ error: 'counselor_id required' }, { status: 400 });
    }
    if (!body.fileBase64) {
      return NextResponse.json({ error: 'fileBase64 required' }, { status: 400 });
    }

    const source: 'imported' | 'bulk' = body.source ?? 'bulk';

    // Decode the file
    const buf = Buffer.from(body.fileBase64, 'base64');
    const wb = XLSX.read(buf, { type: 'buffer' });

    const supabase = createClient();
    const summary: BulkSummary[] = [];

    for (const sheetName of wb.SheetNames) {
      const visitType = detectVisitTypeFromSheetName(sheetName);
      if (!visitType) {
        if (sheetName.toLowerCase() !== 'list') {
          // unknown — skip
        }
        continue;
      }
      if (body.sheetName && body.sheetName !== sheetName) continue;

      const ws = wb.Sheets[sheetName];
      const layout = SHEET_LAYOUTS[visitType];
      const colMap = mapColumns(ws, layout.columns);
      const dataStartRow = detectDataStart(ws);
      const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');

      const s: BulkSummary = {
        visit_type: visitType,
        parsed: 0,
        inserted: 0,
        duplicates: 0,
        skipped: 0,
        errors: [],
      };

      for (let R = dataStartRow; R <= range.e.r + 1; R++) {
        s.parsed++;

        // Read every cell into a `raw` object keyed by registry key
        const raw: Record<string, unknown> = {};
        let filled = 0;
        for (const [letter, key] of colMap.entries()) {
          const addr = `${letter}${R}`;
          const cell = ws[addr];
          const col = layout.columns.find((c) => c.key === key);
          if (!col) continue;
          let v = cell?.v;
          if (v === undefined || v === null || v === '') continue;
          if (col.type === 'date' || key.includes('date')) {
            v = normaliseValue(v, col);
          } else if (typeof v === 'string') {
            v = v.trim();
            if (!v) continue;
          }
          raw[key] = v;
          filled++;
        }

        // Skip rows with no usable identifier
        const nameKey = CLIENT_NAME_KEY[visitType];
        const nidKey = PRIMARY_NID_KEY[visitType];
        const name = (raw[nameKey] as string | undefined)?.trim() ?? '';
        const nidDigits = ((raw[nidKey] as string | undefined) ?? '').replace(/\D/g, '');
        if (!name && !nidDigits && filled <= 2) {
          s.skipped++;
          continue;
        }

        try {
          const inserted = await insertOne(supabase, visitType, raw, {
            counselor_id: body.counselor_id,
            source,
            sheet_row_no: R,
          });
          if (inserted.duplicate) s.duplicates++;
          else s.inserted++;
        } catch (err: any) {
          s.errors.push({ row: R, message: err?.message ?? String(err) });
        }
      }
      summary.push(s);
    }

    return NextResponse.json({
      ok: true,
      duration_ms: Date.now() - t0,
      summary,
      grand_total: summary.reduce(
        (acc, s) => ({
          parsed: acc.parsed + s.parsed,
          inserted: acc.inserted + s.inserted,
          duplicates: acc.duplicates + s.duplicates,
          skipped: acc.skipped + s.skipped,
          errors: acc.errors + s.errors.length,
        }),
        { parsed: 0, inserted: 0, duplicates: 0, skipped: 0, errors: 0 }
      ),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Insert one parsed row.  Returns { inserted: true } or { duplicate: true }.
// ---------------------------------------------------------------------------
async function insertOne(
  supabase: ReturnType<typeof createClient>,
  type: VisitType,
  raw: Record<string, unknown>,
  ctx: { counselor_id: string; source: 'imported' | 'bulk'; sheet_row_no: number }
): Promise<{ id?: string; duplicate: boolean }> {
  const data = buildDataPayload(type, raw);
  const visitRow = buildVisitRow(type, raw);

  // pregnancy_month → session_number fallback
  if (type === 'pregnancy' && !visitRow.session_number && raw.pregnancy_month) {
    visitRow.session_number = String(raw.pregnancy_month).trim();
  }
  // children session_date
  if (type === 'children' && !visitRow.visit_date && raw.session_date) {
    visitRow.visit_date = parseFlexibleDate(String(raw.session_date));
  }

  // NID resolution
  const primaryNidKey = PRIMARY_NID_KEY[type];
  const phoneKey = PHONE_KEY[type];
  let nid = ((raw[primaryNidKey] as string | undefined) ?? '').replace(/\D/g, '');
  if (!nid || nid.length !== 14) {
    if (type === 'pre_marriage') {
      nid = ((raw['spouse_national_id'] as string | undefined) ?? '').replace(/\D/g, '');
    }
  }
  const phone = (data[phoneKey] as string | undefined) ?? null;
  const clientName = ((raw[CLIENT_NAME_KEY[type]] as string | undefined) ?? '').trim();

  // Find-or-create client
  let clientId: string | null = null;
  if (nid && nid.length === 14) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id')
      .eq('client_type', type)
      .eq('national_id', nid)
      .maybeSingle();
    if (existing) {
      clientId = existing.id;
      await supabase
        .from('clients')
        .update({
          full_name: clientName || undefined,
          phone: phone || undefined,
          meta: data,
        })
        .eq('id', clientId);
    } else {
      const { data: ins, error } = await supabase
        .from('clients')
        .insert({
          client_type: type,
          national_id: nid,
          full_name: clientName || '(بدون اسم)',
          phone,
          meta: data,
        })
        .select('id')
        .single();
      if (error) throw error;
      clientId = ins!.id;
    }
  } else {
    const synthetic = `0000${Date.now().toString().slice(-10)}${Math.floor(Math.random() * 1000)}`;
    const { data: ins, error } = await supabase
      .from('clients')
      .insert({
        client_type: type,
        national_id: synthetic,
        full_name: clientName || '(بدون اسم)',
        phone,
        meta: data,
      })
      .select('id')
      .single();
    if (error) throw error;
    clientId = ins!.id;
  }

  // Dedupe check
  if (visitRow.case_number && visitRow.visit_date) {
    const { data: dup } = await supabase
      .from('visits')
      .select('id')
      .eq('visit_type', type)
      .eq('case_number', visitRow.case_number as string)
      .eq('visit_date', visitRow.visit_date as string)
      .maybeSingle();
    if (dup) return { id: dup.id, duplicate: true };
  }

  // Insert visit
  const { data: created, error } = await supabase
    .from('visits')
    .insert({
      visit_type: type,
      client_id: clientId,
      counselor_id: ctx.counselor_id,
      ...visitRow,
      data,
      source: ctx.source,
      sheet_row_no: ctx.sheet_row_no,
      imported_at: new Date().toISOString(),
    })
    .select('id')
    .single();
  if (error) throw error;
  return { id: created!.id, duplicate: false };
}