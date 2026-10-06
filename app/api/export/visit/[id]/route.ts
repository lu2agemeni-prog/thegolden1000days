import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { getVisit } from '@/lib/queries';
import { EXCEL_COLUMNS, type VisitType } from '@/lib/types';

const SHEET_INFO: Record<VisitType, string> = {
  pre_marriage: 'مشورة ما قبل الزواج',
  children: 'سجل المشورة للاطفال',
  pregnancy: 'المشوره الاسريه للحامل',
  family_planning: 'المشوره الاسريه لتنظيم الاسرة',
};

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const visit = await getVisit(params.id);
    if (!visit) return NextResponse.json({ error: 'not found' }, { status: 404 });

    const type = visit.visit_type as VisitType;
    const cols = EXCEL_COLUMNS[type];
    const row: Record<string, unknown> = {};

    cols.forEach((c) => {
      if (c.key === 'row_no') {
        row[c.key] = 1;
      } else if (c.from === 'visit') {
        row[c.key] = (visit as any)[c.key] ?? '';
      } else if (c.from === 'data') {
        row[c.key] = visit.data?.[c.key] ?? '';
      } else if (c.from === 'client') {
        row[c.key] = (visit.client as any)?.[c.key] ?? '';
      }
    });

    const wb = XLSX.utils.book_new();
    const headerRow = cols.map((c) => c.label);
    const aoa = [headerRow, cols.map((c) => row[c.key] ?? '')];
    const sheet = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, sheet, SHEET_INFO[type].slice(0, 31));

    const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
    const filename = `visit-${visit.id}.xlsx`;

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
