'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  EXCEL_COLUMNS,
  VISIT_TYPES,
  VISIT_TYPE_LABEL,
  type VisitType,
  type Counselor,
} from '@/lib/types';

interface ParsedRow {
  rowIndex: number;
  raw: Record<string, unknown>;
  visit_type: VisitType;
  national_id: string | null;
  full_name: string | null;
}

const SHEET_TYPE_MAP: Record<string, VisitType> = {
  'مشورة ما قبل الزواج': 'pre_marriage',
  'سجل المشورة للاطفال': 'children',
  'سجل المشورة للأطفال': 'children',
  'المشوره الاسريه للحامل': 'pregnancy',
  'المشورة الأسرية للحامل': 'pregnancy',
  'المشوره الاسريه لتنظيم الاسرة': 'family_planning',
  'المشورة الأسرية لتنظيم الأسرة': 'family_planning',
};

const NAME_COL: Record<VisitType, string> = {
  pre_marriage: 'partner_name',
  children: 'mother_name',
  pregnancy: 'client_name',
  family_planning: 'client_name',
};

const NID_COL: Record<VisitType, string> = {
  pre_marriage: 'partner_national_id',
  children: 'mother_national_id',
  pregnancy: 'client_national_id',
  family_planning: 'client_national_id',
};

const PHONE_COL: Record<VisitType, string> = {
  pre_marriage: 'partner_phone',
  children: 'mother_phone',
  pregnancy: 'client_phone',
  family_planning: 'client_phone',
};

export function UploadClient({ counselors }: { counselors: Counselor[] }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [counselorId, setCounselorId] = useState<string>(counselors[0]?.id ?? '');
  const [progress, setProgress] = useState<{
    done: number;
    total: number;
    ok: number;
    fail: number;
  } | null>(null);

  function detectType(sheetName: string): VisitType | null {
    const trimmed = sheetName.trim();
    for (const key of Object.keys(SHEET_TYPE_MAP)) {
      if (trimmed.includes(key) || key.includes(trimmed)) {
        return SHEET_TYPE_MAP[key];
      }
    }
    // Fallback: match by English
    const lower = trimmed.toLowerCase();
    if (lower.includes('marriage') || lower.includes('زواج')) return 'pre_marriage';
    if (lower.includes('طفل') || lower.includes('children')) return 'children';
    if (lower.includes('حامل') || lower.includes('pregnancy')) return 'pregnancy';
    if (lower.includes('تنظيم') || lower.includes('planning')) return 'family_planning';
    return null;
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setErrors([]);
    setParsed([]);
    setFileName(file.name);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });

      const out: ParsedRow[] = [];
      const errs: string[] = [];

      for (const sheetName of wb.SheetNames) {
        const type = detectType(sheetName);
        if (!type) {
          if (sheetName.toLowerCase() !== 'list') {
            errs.push(`شيت "${sheetName}" - لم نتمكن من تحديد نوع المشورة، تم تخطيه`);
          }
          continue;
        }

        const ws = wb.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: '',
          raw: false,
        });

        const expectedCols = EXCEL_COLUMNS[type];
        const colKeyToExcel: Record<string, string> = {};
        const excelKeyToCol: Record<string, string> = {};
        // First row of the Excel contains headers (row 1), but in the user's
        // file the real headers are at row 3 (row1 is the title, row2 empty).
        // Since sheet_to_json uses row 1 as headers, we work with the raw
        // sheet to find correct columns.  For simplicity we extract by cell
        // address using the actual Excel column letters.
        const cellHeaders: Record<string, string> = {};
        const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
        for (let R = 0; R <= Math.min(range.s.r + 2, range.e.r); R++) {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const addr = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = ws[addr];
            if (cell) {
              cellHeaders[XLSX.utils.encode_col(C) + (R + 1)] = String(cell.v ?? '');
            }
          }
        }

        // Find row containing "اسم" + "الرقم القومي" (row 4 or 5 in the user's file)
        const headerRowLetter: Record<string, string> = {};
        const labelToCol: Record<string, string> = {};
        // scan rows
        Object.entries(cellHeaders).forEach(([addr, label]) => {
          if (label) labelToCol[addr] = label.trim();
        });

        // Build mapping: for each expected column label, find the cell address
        // whose value matches the label (or section header in row 3).
        expectedCols.forEach((ec) => {
          for (const [addr, label] of Object.entries(labelToCol)) {
            if (label === ec.label) {
              const colLetter = addr.replace(/\d+/g, '');
              headerRowLetter[ec.key] = colLetter;
              excelKeyToCol[colLetter] = ec.key;
              break;
            }
          }
        });

        if (Object.keys(headerRowLetter).length === 0) {
          errs.push(`شيت "${sheetName}" - لم نتمكن من العثور على عناوين الأعمدة`);
          continue;
        }

        // data starts at the row AFTER the last header row in the file.
        // The user's template has headers in rows 3-5; data begins at row 6.
        const dataStartRow = 6;

        for (let R = dataStartRow; R <= range.e.r + 1; R++) {
          const raw: Record<string, unknown> = {};
          let hasData = false;
          expectedCols.forEach((ec) => {
            const col = headerRowLetter[ec.key];
            if (!col) return;
            const addr = `${col}${R}`;
            const cell = ws[addr];
            const v = cell ? String(cell.v ?? '').trim() : '';
            if (v) hasData = true;
            raw[ec.key] = v;
          });

          if (!hasData) continue;

          // Build visit_type-specific data payload
          const data: Record<string, unknown> = {};
          expectedCols.forEach((ec) => {
            if (ec.from === 'data' && raw[ec.key]) {
              data[ec.key] = raw[ec.key];
            }
          });

          // Build client info
          const fullName = String(raw[NAME_COL[type]] ?? '').trim();
          const nationalId = String(raw[NID_COL[type]] ?? '').replace(/\D/g, '');

          out.push({
            rowIndex: R,
            raw,
            visit_type: type,
            national_id: nationalId || null,
            full_name: fullName || null,
          });
        }
      }

      setParsed(out);
      setErrors(errs);
    } catch (err: any) {
      setErrors([`فشل قراءة الملف: ${err.message}`]);
    } finally {
      setBusy(false);
    }
  }

  async function commitImport() {
    if (!counselorId) {
      alert('يجب اختيار المدخل أولاً');
      return;
    }
    if (parsed.length === 0) return;

    setBusy(true);
    setProgress({ done: 0, total: parsed.length, ok: 0, fail: 0 });

    let ok = 0;
    let fail = 0;

    for (let i = 0; i < parsed.length; i++) {
      const row = parsed[i];
      try {
        const res = await fetch('/api/upload/visit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visit_type: row.visit_type,
            national_id: row.national_id,
            full_name: row.full_name,
            counselor_id: counselorId,
            raw_row: row.raw,
            data: buildData(row),
          }),
        });
        if (res.ok) ok++;
        else {
          fail++;
          const j = await res.json();
          console.error(`Row ${row.rowIndex} failed:`, j.error);
        }
      } catch (err) {
        fail++;
      }
      setProgress({ done: i + 1, total: parsed.length, ok, fail });
    }

    setBusy(false);
    alert(`تم استيراد ${ok} زيارة بنجاح${fail ? `، فشل ${fail}` : ''}`);
    setParsed([]);
    setFileName(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function buildData(row: ParsedRow): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    Object.entries(row.raw).forEach(([k, v]) => {
      if (!v) return;
      const col = EXCEL_COLUMNS[row.visit_type].find((c) => c.key === k);
      if (col && col.from === 'data') out[k] = v;
    });
    return out;
  }

  // Group parsed by type for display
  const byType = parsed.reduce<Record<VisitType, number>>(
    (acc, p) => {
      acc[p.visit_type] = (acc[p.visit_type] ?? 0) + 1;
      return acc;
    },
    { pre_marriage: 0, children: 0, pregnancy: 0, family_planning: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          اختر ملف Excel
        </h2>
        <div className="text-sm text-slate-600 mb-4">
          يجب أن يحتوي الملف على الشيتات التالية (بنفس أسمائها المعتادة):
          <ul className="list-disc pr-5 mt-2 space-y-1">
            <li>مشورة ما قبل الزواج</li>
            <li>سجل المشورة للأطفال</li>
            <li>المشورة الأسرية للحامل</li>
            <li>المشورة الأسرية لتنظيم الأسرة</li>
          </ul>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            المدخل المسؤول (سيُسند إلى كل الزيارات المستوردة)
          </label>
          <select
            className="w-full max-w-md px-3 py-2 border border-slate-300 rounded-md text-sm bg-white"
            value={counselorId}
            onChange={(e) => setCounselorId(e.target.value)}
          >
            <option value="">— اختر —</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} {c.employee_code ? `(${c.employee_code})` : ''}
              </option>
            ))}
          </select>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFile}
          disabled={busy}
          className="block w-full text-sm text-slate-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary-50 file:text-primary-700
            hover:file:bg-primary-100"
        />

        {busy && !progress && (
          <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="animate-spin" size={16} />
            جارٍ قراءة الملف...
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            تحذيرات
          </h3>
          <ul className="text-sm text-amber-700 list-disc pr-5 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {parsed.length > 0 && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-3">
            <FileSpreadsheet className="inline-block ml-2" size={18} />
            معاينة البيانات المستخرجة من: {fileName}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {VISIT_TYPES.map((t) => (
              <div
                key={t}
                className="border rounded-md p-3 text-center"
              >
                <div className="text-2xl font-bold text-primary-700">
                  {byType[t]}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {VISIT_TYPE_LABEL[t]}
                </div>
              </div>
            ))}
          </div>

          <div className="text-sm text-slate-600 mb-4">
            إجمالي: <span className="font-semibold">{parsed.length}</span> صف سيُستورد
          </div>

          <button
            onClick={commitImport}
            disabled={busy || !counselorId}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-md flex items-center gap-2"
          >
            <Upload size={18} />
            استيراد {parsed.length} صف
          </button>
        </div>
      )}

      {progress && (
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <h3 className="text-base font-semibold text-slate-800 mb-2">
            جارٍ الاستيراد...
          </h3>
          <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className="bg-primary-600 h-2 transition-all"
              style={{ width: `${(progress.done / progress.total) * 100}%` }}
            />
          </div>
          <div className="text-sm text-slate-600">
            {progress.done} / {progress.total} صف
            {progress.ok > 0 && (
              <span className="text-emerald-600 mr-3 inline-flex items-center gap-1">
                <CheckCircle size={14} />
                نجح: {progress.ok}
              </span>
            )}
            {progress.fail > 0 && (
              <span className="text-red-600 mr-3 inline-flex items-center gap-1">
                <AlertTriangle size={14} />
                فشل: {progress.fail}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}