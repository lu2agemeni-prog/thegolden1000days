'use client';

import { Printer } from 'lucide-react';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-md text-sm flex items-center gap-1"
    >
      <Printer size={14} />
      طباعة
    </button>
  );
}
