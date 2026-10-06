'use client';

import { useState, useEffect } from 'react';
import type { FieldDef, FieldType } from '@/lib/types';

interface FieldInputProps {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}

export function FieldInput({ field, value, onChange, disabled }: FieldInputProps) {
  return (
    <div className={field.span === 3 ? 'col-span-2 md:col-span-2' : 'col-span-2'}>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <Input field={field} value={value} onChange={onChange} disabled={disabled} />
      {field.hint && (
        <p className="text-xs text-slate-500 mt-1">{field.hint}</p>
      )}
    </div>
  );
}

function Input({
  field,
  value,
  onChange,
  disabled,
}: {
  field: FieldDef;
  value: unknown;
  onChange: (v: unknown) => void;
  disabled?: boolean;
}) {
  const base =
    'w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100';

  switch (field.type as FieldType) {
    case 'textarea':
      return (
        <textarea
          rows={3}
          className={base}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );

    case 'select':
      return (
        <select
          className={base}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
        >
          <option value="">— اختر —</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case 'date':
      return (
        <input
          type="date"
          className={base}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          disabled={disabled}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          inputMode="decimal"
          className={base}
          value={(value as number | string) ?? ''}
          onChange={(e) =>
            onChange(e.target.value === '' ? null : Number(e.target.value))
          }
          disabled={disabled}
        />
      );

    case 'phone':
      return (
        <PhoneInput value={(value as string) ?? ''} onChange={onChange} disabled={disabled} />
      );

    case 'national_id':
      return (
        <NationalIdInput
          value={(value as string) ?? ''}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case 'boolean':
      return (
        <select
          className={base}
          value={value === true ? 'true' : value === false ? 'false' : ''}
          onChange={(e) =>
            onChange(
              e.target.value === '' ? null : e.target.value === 'true'
            )
          }
          disabled={disabled}
        >
          <option value="">—</option>
          <option value="true">نعم</option>
          <option value="false">لا</option>
        </select>
      );

    default:
      return (
        <input
          type="text"
          className={base}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
      );
  }
}

function PhoneInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="tel"
      inputMode="numeric"
      dir="ltr"
      maxLength={11}
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100 text-left"
      value={value}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
        onChange(digits);
      }}
      disabled={disabled}
      placeholder="01XXXXXXXXX"
    />
  );
}

function NationalIdInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      dir="ltr"
      maxLength={14}
      className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm bg-white disabled:bg-slate-100 text-left tracking-wider"
      value={value}
      onChange={(e) => {
        const digits = e.target.value.replace(/\D/g, '').slice(0, 14);
        onChange(digits);
      }}
      disabled={disabled}
      placeholder="14 رقم"
    />
  );
}