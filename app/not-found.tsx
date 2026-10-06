import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-800">404</h1>
        <p className="text-lg text-slate-600 mt-4">الصفحة غير موجودة</p>
        <Link
          href="/"
          className="inline-block mt-6 text-primary-600 hover:underline"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}