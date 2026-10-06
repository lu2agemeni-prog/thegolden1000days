import { NextResponse } from 'next/server';
import { mockDb } from '@/lib/mock-db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email } = body;

    const res = NextResponse.json({ ok: true });

    if (action === 'signout') {
      res.cookies.set('mock_logged_out', 'true', { path: '/', httpOnly: false });
      return res;
    }

    if (action === 'signin' || action === 'signup') {
      res.cookies.set('mock_logged_out', 'false', { path: '/', httpOnly: false });
      const counselor = mockDb.getCounselors(true).find((c) => c.email === email) || mockDb.getCounselors(true)[0];
      return NextResponse.json({
        data: {
          user: { id: counselor.user_id || counselor.id, email: counselor.email || email },
          session: { access_token: 'mock-session-token' },
        },
        error: null,
      }, {
        headers: {
          'Set-Cookie': 'mock_logged_out=false; Path=/; HttpOnly=false',
        },
      });
    }

    return res;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
