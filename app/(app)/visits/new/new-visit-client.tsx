'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClientSearch } from '@/components/ClientSearch';
import { VisitForm } from '@/components/VisitForm';
import {
  VISIT_TYPE_LABEL,
  VISIT_TYPE_SHORT,
  VISIT_TYPES,
  type VisitType,
  type Counselor,
  type Client,
} from '@/lib/types';
import { Heart, Baby, Stethoscope, Calendar } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const TYPE_ICON: Record<VisitType, LucideIcon> = {
  pre_marriage: Heart,
  children: Baby,
  pregnancy: Stethoscope,
  family_planning: Calendar,
};

export function NewVisitPage({
  initialType,
  counselors,
}: {
  initialType: VisitType | null;
  counselors: Counselor[];
}) {
  const [type, setType] = useState<VisitType | null>(initialType);
  const [client, setClient] = useState<Client | null>(null);

  if (!type) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">زيارة جديدة</h1>
          <p className="text-sm text-slate-500 mt-1">اختر نوع المشورة أولاً</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VISIT_TYPES.map((t) => {
            const Icon = TYPE_ICON[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="bg-white border-2 border-slate-200 hover:border-primary-400 hover:shadow-md rounded-lg p-6 text-right transition flex items-center gap-4"
              >
                <div className="p-3 bg-primary-50 text-primary-600 rounded-full">
                  <Icon size={28} />
                </div>
                <div>
                  <div className="font-semibold text-slate-800">
                    {VISIT_TYPE_LABEL[t]}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    اضغط لبدء إدخال زيارة جديدة
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            زيارة جديدة — {VISIT_TYPE_SHORT[type]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            ابحث عن العميل أولاً، فإن لم تجده سيتم إنشاء سجل جديد
          </p>
        </div>
        <button
          onClick={() => {
            setType(null);
            setClient(null);
          }}
          className="text-sm text-slate-500 hover:underline"
        >
          ← تغيير نوع المشورة
        </button>
      </div>

      <ClientSearch type={type} onPick={setClient} selected={client} />

      <VisitForm
        type={type}
        client={client}
        counselors={counselors}
        prefillFromClient={true}
      />
    </div>
  );
}