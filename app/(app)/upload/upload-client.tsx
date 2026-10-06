'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Download,
  Lock,
  CheckCircle2,
  Table,
} from 'lucide-react';
import {
  EXCEL_COLUMNS,
  VISIT_TYPES,
  VISIT_TYPE_LABEL,
  VISIT_TYPE_SHEET_NAME,
  detectVisitTypeFromSheetName,
  CLIENT_NAME_KEY,
  PRIMARY_NID_KEY,
  PHONE_KEY,
  type VisitType,
  type Counselor,
} from '@/lib/types';

interface ParsedRow {
  rowIndex: number;
  raw: Record<string, unknown>;
  visit_type: VisitType;
  national_id: string | null;
  full_name: string | null;
  dataCount: number;
}

// Normalize Arabic text for robust header matching across dialect variants.
function cleanArabic(s: unknown): string {
  return String(s ?? '')
    .replace(/[\u064B-\u065F\u0670]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\s\t\r\n\u200f\u200e]+/g, ' ')
    .replace(/[(),.\/\\\-_]/g, '')
    .trim()
    .toLowerCase();
}

// Excel date → YYYY-MM-DD.  Handles YYYY-MM-DD, DD/MM/YYYY, and serial numbers.
function formatExcelDate(val: unknown): string {
  if (val === undefined || val === null || val === '') return '';
  if (val instanceof Date) return val.toISOString().slice(0, 10);
  if (typeof val === 'number') {
    if (val > 25000 && val < 80000) {
      const date = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) return date.toISOString().slice(0, 10);
    }
    return String(val);
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(s)) {
    const [y, m, d] = s.split(/[-\/]/);
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  const m = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (m) {
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return s;
}

/** Map the headers in a sheet to the canonical EXCEL_COLUMNS keys. */
function mapSheetColumns(
  sheet: XLSX.WorkSheet,
  type: VisitType
): { letterToKey: Map<string, string>; dataStartRow: number } {
  const cols = EXCEL_COLUMNS[type];
  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  const letterToKey = new Map<string, string>();

  // Headers (rows 1, 2, 3 → 0, 1, 2) per column
  const headerByLetter = new Map<string, string>();
  for (let C = range.s.c; C <= range.e.c; C++) {
    const letter = XLSX.utils.encode_col(C);
    const c0 = String(sheet[XLSX.utils.encode_cell({ r: 0, c: C })]?.v ?? '').trim();
    const c1 = String(sheet[XLSX.utils.encode_cell({ r: 1, c: C })]?.v ?? '').trim();
    const c2 = String(sheet[XLSX.utils.encode_cell({ r: 2, c: C })]?.v ?? '').trim();
    headerByLetter.set(letter, [c0, c1, c2].filter(Boolean).join(' ') || c0);
  }

  // 1) Positional match (Ministry file layout)
  cols.forEach((c, idx) => {
    const letter = XLSX.utils.encode_col(idx);
    if (headerByLetter.has(letter)) letterToKey.set(letter, c.key);
  });

  // 2) Fuzzy fallback for any column not yet mapped
  for (const c of cols) {
    if ([...letterToKey.values()].includes(c.key)) continue;
    const target = cleanArabic(c.label);
    for (const [letter, text] of headerByLetter.entries()) {
      if ([...letterToKey.keys()].includes(letter)) continue;
      const t = cleanArabic(text);
      if (t === target || (target.length > 4 && t.includes(target))) {
        letterToKey.set(letter, c.key);
        break;
      }
    }
  }

  // Detect first data row
  let dataStartRow = 4;
  for (let R = 1; R <= Math.min(10, range.e.r + 1); R++) {
    const v = sheet[XLSX.utils.encode_cell({ r: R - 1, c: 0 })]?.v;
    if (v === 1 || v === '1' || v === '1.0') {
      dataStartRow = R;
      break;
    }
    for (let C = 0; C <= Math.min(range.e.c, 30); C++) {
      const digits = String(
        sheet[XLSX.utils.encode_cell({ r: R - 1, c: C })]?.v ?? ''
      ).replace(/\D/g, '');
      if (digits.length === 14) {
        dataStartRow = R;
        break;
      }
    }
  }

  return { letterToKey, dataStartRow };
}

export function UploadClient({ counselors }: { counselors: Counselor[] }) {
  // ----- password gate -----
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  async function verifyPassword(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('/api/upload/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthed(true);
        sessionStorage.setItem('upload_pw', password);
      } else {
        const j = await res.json().catch(() => ({}));
        setAuthError(j.error ?? 'كلمة المرور غير صحيحة');
      }
    } catch (err: any) {
      setAuthError(err.message ?? 'فشل التحقق');
    } finally {
      setAuthLoading(false);
    }
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto bg-white border rounded-lg p-6 shadow-sm">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-primary-50 text-primary-600 rounded-full mb-3">
            <Lock size={24} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800">رفع ملف قديم</h2>
          <p className="text-sm text-slate-500 mt-1">
            هذه الصفحة محمية — أدخل كلمة المرور للمتابعة
          </p>
        </div>
        <form onSubmit={verifyPassword} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              كلمة المرور
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              placeholder="•••••"
              autoFocus
            />
          </div>
          {authError && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-2 rounded-md text-sm">
              {authError}
            </div>
          )}
          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-md flex items-center justify-center gap-2"
          >
            {authLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                جارٍ التحقق...
              </>
            ) : (
              'دخول'
            )}
          </button>
        </form>
      </div>
    );
  }

  return <UploadBody counselors={counselors} />;
}

function UploadBody({ counselors }: { counselors: Counselor[] }) {
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
    duplicates: number;
  } | null>(null);
  const [fileFormatMatch, setFileFormatMatch] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setErrors([]);
    setParsed([]);
    setFileName(file.name);
    setFileFormatMatch(null);

    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const out: ParsedRow[] = [];
      const errs: string[] = [];
      let detected1000 = false;

      for (const sheetName of wb.SheetNames) {
        const type = detectVisitTypeFromSheetName(sheetName);
        if (!type) {
          if (sheetName.toLowerCase() !== 'list') {
            errs.push(`شيت "${sheetName}" - لم نتمكن من تحديد نوع المشورة، تم تخطيه`);
          }
          continue;
        }
        const ws = wb.Sheets[sheetName];
        const { letterToKey, dataStartRow } = mapSheetColumns(ws, type);
        if (letterToKey.size === 0) {
          errs.push(`شيت "${sheetName}" - لم نتمكن من قراءة العناوين`);
          continue;
        }
        if (letterToKey.size >= EXCEL_COLUMNS[type].length - 1) {
          detected1000 = true;
        }

        const range = XLSX.utils.decode_range(ws['!ref'] ?? 'A1');
        for (let R = dataStartRow; R <= range.e.r + 1; R++) {
          const raw: Record<string, unknown> = {};
          let filled = 0;
          for (const [letter, key] of letterToKey.entries()) {
            const cell = ws[`${letter}${R}`];
            if (!cell) continue;
            let v = cell.v;
            if (v === undefined || v === null || v === '') continue;
            if (key.includes('date') || key === 'first_visit_date' || key === 'session_date' || key === 'visit_date') {
              v = formatExcelDate(v);
            } else if (typeof v === 'string') {
              v = v.trim();
              if (!v) continue;
            }
            raw[key] = v;
            filled++;
          }
          // Skip empty rows
          const nameKey = CLIENT_NAME_KEY[type];
          const nidKey = PRIMARY_NID_KEY[type];
          const fullName = (raw[nameKey] as string | undefined)?.trim() ?? '';
          const nationalId = ((raw[nidKey] as string | undefined) ?? '').replace(/\D/g, '');
          if (!fullName && !nationalId && filled <= 2) continue;

          out.push({
            rowIndex: R,
            raw,
            visit_type: type,
            national_id: nationalId || null,
            full_name: fullName || null,
            dataCount: filled,
          });
        }
      }
      setParsed(out);
      setErrors(errs);
      if (detected1000) {
        setFileFormatMatch('ملف 1000 المعتمد (تمت المطابقة بنجاح)');
      }
    } catch (err: any) {
      setErrors([`فشل قراءة الملف: ${err.message}`]);
    } finally {
      setBusy(false);
    }
  }

  async function commitImport() {
    if (!counselorId) {
      alert('يجب اختيار المدخل المسؤول أولاً');
      return;
    }
    if (parsed.length === 0) return;

    const pw = sessionStorage.getItem('upload_pw') ?? '';
    if (!pw) {
      alert('انتهت صلاحية كلمة المرور، أعد تحميل الصفحة');
      return;
    }

    setBusy(true);
    setProgress({ done: 0, total: parsed.length, ok: 0, fail: 0, duplicates: 0 });

    let ok = 0;
    let fail = 0;
    let dup = 0;

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
            sheet_row_no: row.rowIndex,
            source: 'imported',
            password: pw,
          }),
        });
        if (res.ok) {
          const body = await res.json().catch(() => ({}));
          if (body.duplicate) dup++;
          else ok++;
        } else {
          fail++;
        }
      } catch {
        fail++;
      }
      setProgress({ done: i + 1, total: parsed.length, ok, fail, duplicates: dup });
    }

    setBusy(false);
  }

  function buildData(row: ParsedRow): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    const cols = EXCEL_COLUMNS[row.visit_type];
    cols.forEach((c) => {
      if (c.from === 'data') {
        const v = row.raw[c.key];
        if (v !== undefined && v !== null && v !== '') {
          out[c.key] = v;
        }
      }
    });
    return out;
  }

  const byType = parsed.reduce<Record<VisitType, number>>(
    (acc, p) => {
      acc[p.visit_type] = (acc[p.visit_type] ?? 0) + 1;
      return acc;
    },
    { pre_marriage: 0, children: 0, pregnancy: 0, family_planning: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Download template banner */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-700" />
            <span>نموذج إكسيل المعتمد (ملف 1000)</span>
          </div>
          <div className="text-xs text-emerald-800 mt-1">
            الملف يحتوي على الـ 4 شيتات بنفس ترتيب وعناوين أعمدة وزارة الصحة والسكان بدقة.
          </div>
        </div>
        <a
          href="/api/template/download"
          download
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-semibold flex items-center gap-1 shadow-sm transition"
        >
          <Download size={14} />
          تحميل نموذج ملف 1000
        </a>
      </div>

      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          اختر ملف Excel (يدعم ملف 1000 والملفات السابقة)
        </h2>
        <div className="text-sm text-slate-600 mb-4">
          يقوم النظام تلقائياً بالتعرف على الشيتات وتطابق الأعمدة حتى مع اختلاف الهمزات أو المسميات.
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
            <option value="">— اختر المدخل —</option>
            {counselors.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} {c.employee_code ? `(${c.employee_code})` : ''}
                {!c.is_active ? ' [غير نشط]' : ''}
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
            جارٍ فحص ومطابقة أعمدة الملف...
          </div>
        )}
      </div>

      {errors.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
          <h3 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
            <AlertTriangle size={16} />
            تنبيهات أثناء الفحص
          </h3>
          <ul className="text-sm text-amber-700 list-disc pr-5 space-y-1">
            {errors.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Parse Results & Summary */}
      {parsed.length > 0 && (
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2 border-b pb-3">
            <div>
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-600" size={20} />
                <h3 className="font-semibold text-slate-800 text-base">
                  تم تحليل الملف: {fileName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                إجمالي الزيارات الصالحة المستخرجة: <strong className="text-slate-800">{parsed.length}</strong> زيارة
              </p>
            </div>

            {fileFormatMatch && (
              <span className="bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 size={13} />
                {fileFormatMatch}
              </span>
            )}
          </div>

          {/* Counts by Type */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {VISIT_TYPES.map((t) => (
              <div key={t} className="bg-slate-50 border rounded-lg p-3 text-center">
                <div className="text-xs text-slate-500">{VISIT_TYPE_LABEL[t]}</div>
                <div className="text-xl font-bold text-slate-800 mt-1">{byType[t]}</div>
              </div>
            ))}
          </div>

          {/* Preview of first rows */}
          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <Table size={14} />
              <span>معاينة للبيانات المستخرجة (أول 5 زيارات):</span>
            </div>
            <div className="border rounded-md overflow-x-auto text-xs">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50 text-slate-700 font-semibold">
                  <tr>
                    <th className="px-3 py-2 text-right">نوع المشورة</th>
                    <th className="px-3 py-2 text-right">الاسم المستخرج</th>
                    <th className="px-3 py-2 text-right">الرقم القومي</th>
                    <th className="px-3 py-2 text-right">رقم الموبايل</th>
                    <th className="px-3 py-2 text-right">المنشأة الصحية</th>
                    <th className="px-3 py-2 text-right">تاريخ الزيارة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {parsed.slice(0, 5).map((p, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="px-3 py-2 font-medium text-slate-800">
                        {VISIT_TYPE_LABEL[p.visit_type]}
                      </td>
                      <td className="px-3 py-2 font-medium">
                        {p.full_name || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 font-mono" dir="ltr">
                        {p.national_id || <span className="text-slate-400">—</span>}
                      </td>
                      <td className="px-3 py-2 font-mono" dir="ltr">
                        {(p.raw[PHONE_KEY[p.visit_type]] as string) || '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {(p.raw['health_facility'] as string) || '—'}
                      </td>
                      <td className="px-3 py-2 font-mono">
                        {((p.raw['visit_date'] || p.raw['first_visit_date'] || p.raw['session_date']) as string) || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Import Button */}
          {!progress && (
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                سيتم حفظ السجلات مع ربطها تلقائياً بالمدخل المختار
              </span>
              <button
                type="button"
                onClick={commitImport}
                disabled={busy}
                className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-md flex items-center gap-2 shadow-sm transition"
              >
                <Upload size={16} />
                بدء استيراد {parsed.length} زيارة
              </button>
            </div>
          )}
        </div>
      )}

      {/* Progress View */}
      {progress && (
        <div className="bg-white border rounded-lg p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800">
              جارٍ الاستيراد إلى قاعدة البيانات...
            </span>
            <span className="text-slate-500 font-mono">
              {progress.done} / {progress.total}
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className="bg-primary-600 h-full transition-all duration-200"
              style={{
                width: `${(progress.done / progress.total) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
            <span className="text-emerald-600 font-medium flex items-center gap-1">
              <CheckCircle size={14} />
              تم بنجاح: {progress.ok}
            </span>
            {progress.duplicates > 0 && (
              <span className="text-amber-600 font-medium">
                مكررة (تم تجاهلها): {progress.duplicates}
              </span>
            )}
            {progress.fail > 0 && (
              <span className="text-red-600 font-medium">
                فشل: {progress.fail}
              </span>
            )}
          </div>

          {progress.done === progress.total && (
            <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                اكتمل الاستيراد! تم حفظ {progress.ok} زيارة، وتجاهل {progress.duplicates} مكررة.
              </span>
              <a
                href="/visits"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded transition"
              >
                عرض الزيارات
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
