import { NextResponse } from 'next/server';
import { searchClients } from '@/lib/queries';
import type { VisitType } from '@/lib/types';

const VALID: VisitType[] = ['pre_marriage', 'children', 'pregnancy', 'family_planning'];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') as VisitType | null;
  let q = url.searchParams.get('q') ?? '';

  try {
    if (q.includes('%')) {
      q = decodeURIComponent(q);
    }
  } catch {
    // ignore
  }

  if (!type || !VALID.includes(type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 });
  }
  if (q.trim().length < 2) {
    return NextResponse.json({ clients: [] });
  }

  try {
    const clients = await searchClients(type, q.trim());
    return NextResponse.json({ clients });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
