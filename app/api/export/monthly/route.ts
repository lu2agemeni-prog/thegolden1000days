// app/app/api/export/monthly/route.ts
import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';
import {
  EXCEL_COLUMNS,
  VISIT_TYPES,
  VISIT_TYPE_SHEET_NAME,
  type VisitType,
} from '@/lib/types';

export const dynamic = 'force-dynamic';

/**
 * GET /api/export/monthly
 *
 * Query params:
 *   - month  YYYY-MM    (preferred — selects the whole month, ignoring day)
 *   - from   YYYY-MM-DD (optional — used if `month` is absent)
 *   - to     YYYY-MM-DD (optional — used if `month` is absent)
 *   - type   pre_marriage | children | pregnancy | family_planning
 *
 * Returns an .xlsx with one sheet per visit type, using the canonical
 * column order from `lib/column-registry.ts`.
 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const month = url.searchParams.get('month');
  const typeParam = url.searchParams.get('type');

  // Resolve the date range.  Month takes precedence.
  let from: string | null = null;
  let to: string | null = null;
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    from = `${month}-01`;
    // last day of the month: jump to next month, subtract 1 day
    const [y, m] = month.split('-').map(Number);
    const nextMonth = m === 12 ? `${y + 1}-01-01` : `${y}-${String(m + 1).padStart(2, '0')}-01`;
    const last = new Date(nextMonth);
    last.setDate(last.getDate() - 1);
    to = last.toISOString().slice(0, 10);
  } else {
    from = url.searchParams.get('from');
    to = url.searchParams.get('to');
  }

  try {
    const supabase = createClient();
    let q = supabase
      .from('visits')
      .select('*, client:clients(*), counselor:counselors(*)')
      .order('visit_date', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true })
      .limit(20000);

    if (from) q = q.gte('visit_date', from);
    if (to) q = q.lte('visit_date', to);
    if (typeParam) q = q.eq('visit_type', typeParam);

    const { data: visits, error } = await q;
    if (error) throw error;

    const wb = XLSX.utils.book_new();
    const types: VisitType[] = typeParam
      ? [typeParam as VisitType]
      : (VISIT_TYPES as VisitType[]);

    for (const type of types) {
      const cols = EXCEL_COLUMNS[type];
      const typeVisits = (visits ?? []).filter((v: any) => v.visit_type === type);

      // Build a row per visit.  Visit-level keys come from the row itself;
      // data-level keys come from `data` jsonb; client-level keys come
      // from the related client record.
      const header = cols.map((c) => c.label);
      const aoa: unknown[][] = [header];
      typeVisits.forEach((v: any, i: number) => {
        const row = cols.map((c) => {
          if (c.key === 'row_no') return i + 1;
          if (c.from === 'visit') return (v as any)[c.key] ?? '';
          if (c.from === 'data') return v.data?.[c.key] ?? '';
          if (c.from === 'client') return v.client?.[c.key as keyof typeof v.client] ?? '';
          return '';
        });
        aoa.push(row);
      });

      const sheet = XLSX.utils.aoa_to_sheet(aoa);
      // Set column widths
      sheet['!cols'] = cols.map((c) => ({
        wch: Math.min(Math.max((c.label?.length || 10) + 2, 10), 36),
      }));
      // Freeze the header row
      sheet['!freeze'] = { xSplit: 0, ySplit: 1 };
      XLSX.utils.book_append_sheet(wb, sheet, VISIT_TYPE_SHEET_NAME[type].slice(0, 31));
    }

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const filename = buildFilename(month, from, to, typeParam);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildFilename(
  month: string | null,
  from: string | null,
  to: string | null,
  type: string | null
): string {
  if (month) {
    let name = `cov-monthly-${month}`;
    if (type) name += `-${type}`;
    return name + '.xlsx';
  }
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let name = `cov-report-${ym}`;
  if (from) name += `-from-${from}`;
  if (to) name += `-to-${to}`;
  if (type) name += `-${type}`;
  return name + '.xlsx';
}