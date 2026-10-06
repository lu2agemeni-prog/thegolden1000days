'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        // The new user account exists but is not yet linked to a counselors row.
        // They will be blocked by RLS until an admin creates their row & links user_id.
        setError(
          'تم إنشاء الحساب بنجاح. يجب أن يقوم مدير النظام بربطك بقائمة المدخلين قبل أن تتمكن من الدخول.'
        );
        setMode('signin');
        return;
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary-800">نظام غرف المشورة</h1>
          <p className="text-sm text-slate-600 mt-2">
            وزارة الصحة والسكان - مصر
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              البريد الإلكتروني
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="example@health.gov.eg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div
              className={`text-sm p-3 rounded-md ${
                error.includes('بنجاح')
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800'
              }`}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-md transition"
          >
            {loading ? 'جارٍ...' : mode === 'signin' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>

          <button
            type="button"
            onClick={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
            }}
            className="w-full text-sm text-primary-600 hover:underline"
          >
            {mode === 'signin'
              ? 'ليس لديك حساب؟ إنشاء حساب جديد'
              : 'لديك حساب؟ تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white">جارٍ التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}