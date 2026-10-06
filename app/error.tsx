'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-3xl font-bold text-red-600">حدث خطأ</h1>
        <p className="text-sm text-slate-600 mt-3">{error.message}</p>
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm"
          >
            إعادة المحاولة
          </button>
          <Link href="/" className="text-slate-600 hover:underline text-sm">
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}