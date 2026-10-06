import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/server';
import { EXCEL_COLUMNS, type VisitType } from '@/lib/types';

// Export visits within a date range as multi-sheet Excel — one sheet per
// counseling type, with the exact columns of the source file.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  const typeParam = url.searchParams.get('type');

  try {
    const supabase = createClient();
    let q = supabase
      .from('visits')
      .select('*, client:clients(*), counselor:counselors(*)')
      .order('visit_date', { ascending: true })
      .limit(10000);

    if (from) q = q.gte('visit_date', from);
    if (to) q = q.lte('visit_date', to);
    if (typeParam) q = q.eq('visit_type', typeParam);

    const { data: visits, error } = await q;
    if (error) throw error;

    const wb = XLSX.utils.book_new();

    const SHEET_INFO: Record<VisitType, string> = {
      pre_marriage: 'مشورة ما قبل الزواج',
      children: 'سجل المشورة للاطفال',
      pregnancy: 'المشوره الاسريه للحامل',
      family_planning: 'المشوره الاسريه لتنظيم الاسرة',
    };

    const TYPES: VisitType[] = typeParam
      ? [typeParam as VisitType]
      : ['pre_marriage', 'children', 'pregnancy', 'family_planning'];

    TYPES.forEach((type) => {
      const cols = EXCEL_COLUMNS[type];
      const typeVisits = (visits ?? []).filter((v: any) => v.visit_type === type);

      const rows = typeVisits.map((v: any, i: number) => {
        const row: Record<string, unknown> = {};
        cols.forEach((c) => {
          if (c.key === 'row_no') {
            row[c.key] = i + 1;
          } else if (c.from === 'visit') {
            row[c.key] = (v as any)[c.key] ?? '';
          } else if (c.from === 'data') {
            row[c.key] = v.data?.[c.key] ?? '';
          } else if (c.from === 'client') {
            row[c.key] = v.client?.[c.key as keyof typeof v.client] ?? '';
          }
        });
        return row;
      });

      const sheet = XLSX.utils.json_to_sheet(rows, { header: cols.map((c) => c.key) });

      // Set column labels (using AOA so we can set our own labels)
      const headerRow = cols.map((c) => c.label);
      const aoa = [headerRow, ...rows.map((r: Record<string, any>) => cols.map((c) => r[c.key] ?? ''))];
      const sheet2 = XLSX.utils.aoa_to_sheet(aoa);

      XLSX.utils.book_append_sheet(wb, sheet2, SHEET_INFO[type].slice(0, 31));
    });

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const filename = buildFilename(from, to, typeParam);

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

function buildFilename(from: string | null, to: string | null, type: string | null): string {
  const now = new Date();
  const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  let name = `cov-report-${ym}`;
  if (from) name += `-from-${from}`;
  if (to) name += `-to-${to}`;
  if (type) name += `-${type}`;
  return name + '.xlsx';
}