import { NextResponse } from 'next/server';
import { searchClients } from '@/lib/queries';
import type { VisitType } from '@/lib/types';

const VALID: VisitType[] = ['pre_marriage', 'children', 'pregnancy', 'family_planning'];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') as VisitType | null;
  const q = url.searchParams.get('q') ?? '';

  if (!type || !VALID.includes(type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }
  if (q.length < 2) {
    return NextResponse.json({ clients: [] });
  }

  try {
    const clients = await searchClients(type, q);
    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}