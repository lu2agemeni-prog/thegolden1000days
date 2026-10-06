import { NextResponse } from 'next/server';
import { updateCounselor, deleteCounselor } from '@/lib/queries';
import { getSessionUser } from '@/lib/auth';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح: تعديل بيانات المدخل متاح لمدير النظام فقط' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const updated = await updateCounselor(params.id, body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionUser();
    if (!session || !session.isAdmin) {
      return NextResponse.json(
        { error: 'غير مصرح: حذف المدخل متاح لمدير النظام فقط' },
        { status: 403 }
      );
    }

    await deleteCounselor(params.id);
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
