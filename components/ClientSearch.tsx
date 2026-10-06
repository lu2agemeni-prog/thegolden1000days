'use client';

import { useState } from 'react';
import { Search, UserPlus } from 'lucide-react';
import type { VisitType, Client } from '@/lib/types';

interface ClientSearchProps {
  type: VisitType;
  onPick: (client: Client | null) => void;
  selected: Client | null;
}

export function ClientSearch({ type, onPick, selected }: ClientSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);

  async function doSearch(e?: React.FormEvent) {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/clients/search?type=${type}&q=${encodeURIComponent(query.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResults(data.clients ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  function pickClient(c: Client) {
    onPick(c);
    setShowNew(true);
  }

  function clearSelection() {
    onPick(null);
    setShowNew(false);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        ابحث عن العميل أولاً (بالاسم أو الرقم القومي)
      </h3>

      {!selected ? (
        <>
          <form onSubmit={doSearch} className="flex gap-2 mb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={type === 'pre_marriage' ? 'اسم الشريك أو الرقم القومي' : 'اسم العميل أو الرقم القومي'}
              className="flex-1 px-3 py-2 border border-slate-300 rounded-md text-sm"
            />
            <button
              type="submit"
              disabled={loading || query.length < 2}
              className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Search size={16} />
              بحث
            </button>
          </form>

          {loading && (
            <p className="text-sm text-slate-500 py-3 text-center">جارٍ البحث...</p>
          )}

          {!loading && results.length === 0 && query.length >= 2 && (
            <p className="text-sm text-slate-500 py-3 text-center">
              لا توجد نتائج — يمكنك إدخال عميل جديد
            </p>
          )}

          {results.length > 0 && (
            <div className="border rounded-md divide-y max-h-72 overflow-y-auto">
              {results.map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => pickClient(c)}
                  className="w-full text-right px-3 py-2 hover:bg-primary-50 flex justify-between items-center text-sm"
                >
                  <div>
                    <div className="font-medium">{c.full_name}</div>
                    <div className="text-xs text-slate-500">
                      رقم قومي: {c.national_id}
                      {c.phone && ` • ${c.phone}`}
                    </div>
                  </div>
                  <div className="text-xs text-primary-600">اختيار ←</div>
                </button>
              ))}
            </div>
          )}

          {!loading && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={() => {
                  onPick(null);
                  setShowNew(true);
                }}
                className="text-sm text-primary-600 hover:underline flex items-center gap-1 mx-auto"
              >
                <UserPlus size={14} />
                أو إدخال عميل جديد
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="bg-emerald-50 border border-emerald-200 rounded-md p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-semibold text-emerald-900">
                {selected.full_name}
              </div>
              <div className="text-xs text-emerald-700 mt-1">
                رقم قومي: {selected.national_id}
                {selected.phone && ` • ${selected.phone}`}
              </div>
            </div>
            <button
              type="button"
              onClick={clearSelection}
              className="text-xs text-slate-500 hover:text-red-600 hover:underline"
            >
              تغيير العميل
            </button>
          </div>
        </div>
      )}
    </div>
  );
}