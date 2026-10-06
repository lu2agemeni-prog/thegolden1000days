import { NextResponse } from 'next/server';
import { createCounselor } from '@/lib/queries';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await createCounselor(body);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}