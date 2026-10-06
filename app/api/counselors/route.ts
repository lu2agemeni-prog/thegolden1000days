import { NextResponse } from 'next/server';
import { createCounselor } from '@/lib/queries';
import { getSessionUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح: إضافة مدخل جديد متاح لمدير النظام فقط' },
        { status: 403 }
      );
    }

    const body = await req.json();
    if (!body.full_name?.trim()) {
      return NextResponse.json({ error: 'اسم المدخل مطلوب' }, { status: 400 });
    }

    const created = await createCounselor(body);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
