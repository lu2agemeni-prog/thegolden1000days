import { NextResponse } from 'next/server';

const UPLOAD_PASSWORD = process.env.UPLOAD_PASSWORD || '54321';

export async function POST(req: Request) {
  try {
    const { password } = await req.json();
    if (typeof password !== 'string') {
      return NextResponse.json({ error: 'كلمة المرور مطلوبة' }, { status: 400 });
    }
    if (password !== UPLOAD_PASSWORD) {
      // Add a tiny delay to discourage brute force
      await new Promise((r) => setTimeout(r, 400));
      return NextResponse.json({ error: 'كلمة المرور غير صحيحة' }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}