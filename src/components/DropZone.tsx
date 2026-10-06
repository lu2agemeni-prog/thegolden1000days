import React, { useRef, useState } from 'react';
import { Archive, UploadCloud, ShieldCheck, Sparkles, FileArchive, ArrowUpRight, Zap } from 'lucide-react';
import { Language } from '../types/zip';
import { translations } from '../utils/translations';
import { generateSampleZip } from '../utils/sampleZip';

interface DropZoneProps {
  onFileLoaded: (file: File | Blob, name: string) => void;
  lang: Language;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileLoaded, lang }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingSample, setIsLoadingSample] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith('.zip') || file.type.includes('zip') || file.type.includes('compressed')) {
        onFileLoaded(file, file.name);
      } else {
        // Still load it even if mime is generic binary
        onFileLoaded(file, file.name);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onFileLoaded(file, file.name);
    }
  };

  const handleLoadSample = async () => {
    try {
      setIsLoadingSample(true);
      const blob = await generateSampleZip();
      onFileLoaded(blob, 'sample_project.zip');
    } catch (err) {
      console.error('Failed to load sample zip:', err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".zip,application/zip,application/x-zip-compressed"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Main Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative overflow-hidden rounded-3xl border-2 border-dashed p-10 md:p-14 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-indigo-400 bg-indigo-500/10 scale-[1.01] shadow-2xl shadow-indigo-500/20'
            : 'border-slate-700/80 bg-slate-900/60 hover:border-indigo-500/60 hover:bg-slate-900/90 shadow-xl'
        }`}
      >
        {/* Ambient background glow */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-indigo-500/25 transition-all duration-500" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/25 transition-all duration-500" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-6">
          {/* Animated Icon Container */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
              <Archive className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -bottom-2 -right-2 p-2 bg-slate-900 rounded-full border border-slate-700 shadow">
              <UploadCloud className="w-5 h-5 text-indigo-400 animate-bounce" />
            </div>
          </div>

          {/* Titles & instructions */}
          <div className="space-y-2 max-w-lg">
            <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              {t.dropZoneTitle}
            </h2>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed">
              {t.dropZoneSubtitle}
            </p>
          </div>

          {/* Action Button */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-md shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all flex items-center gap-2 group-hover:scale-105"
            >
              <FileArchive className="w-4 h-4" />
              <span>{lang === 'ar' ? 'اختر ملف ZIP من جهازك' : 'Choose ZIP from Computer'}</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLoadSample();
              }}
              disabled={isLoadingSample}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-medium hover:text-white transition-all flex items-center gap-2 hover:border-slate-600"
            >
              {isLoadingSample ? (
                <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-amber-400" />
              )}
              <span>{t.sampleButton}</span>
            </button>
          </div>

          <p className="text-xs text-slate-500">
            {t.dropZoneHelp}
          </p>
        </div>
      </div>

      {/* Feature highlights bar */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {lang === 'ar' ? 'أمان وخصوصية تامة 100%' : '100% Client-Side Private'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar'
                ? 'الملفات تُعالج بالكامل على جهازك دون رفعها إلى أي خادم خارجي.'
                : 'All extraction and preview happens inside your browser without uploading.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {lang === 'ar' ? 'معاينة وتعديل فوري' : 'Instant Preview & Edit'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar'
                ? 'استعراض الأكواد، الصور، النصوص، ومستندات Markdown مع إمكانية التعديل.'
                : 'Inspect code, images, docs, and edit text files directly within the archive.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-200">
              {lang === 'ar' ? 'إعادة ضغط وتصدير' : 'Re-compress & Export'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              {lang === 'ar'
                ? 'أضف ملفات جديدة، احذف غير المرغوب، ثم حمّل أرشيفك الجديد بضغطة زر.'
                : 'Add new files, remove entries, and generate a new optimized ZIP file.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
