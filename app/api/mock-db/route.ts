import { NextResponse } from 'next/server';
import { createMockClient } from '@/lib/mock-client';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { table, method = 'select', payload, filters = [], order, limit, single, maybeSingle, selectCols = '*' } = body;

    const client = createMockClient();
    const q: any = client.from(table);

    if (method === 'insert') {
      q.insert(payload);
    } else if (method === 'update') {
      q.update(payload);
    } else if (method === 'delete') {
      q.delete();
    } else {
      q.select(selectCols);
    }

    for (const f of filters) {
      if (f.type === 'eq') q.eq(f.col, f.val);
      else if (f.type === 'gte') q.gte(f.col, f.val);
      else if (f.type === 'lte') q.lte(f.col, f.val);
      else if (f.type === 'ilike') q.ilike(f.col, f.val);
      else if (f.type === 'or') q.or(f.raw);
    }

    if (order?.col) q.order(order.col, { ascending: order.ascending });
    if (limit) q.limit(limit);
    if (single) q.single();
    if (maybeSingle) q.maybeSingle();

    const res = await q;
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ data: null, error: err.message }, { status: 500 });
  }
}
