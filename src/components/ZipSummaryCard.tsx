import React from 'react';
import { Archive, Download, RefreshCw, Layers, HardDrive, Percent, FolderCheck, Sparkles } from 'lucide-react';
import { ZipMetadata, Language } from '../types/zip';
import { formatBytes } from '../utils/formatters';
import { translations } from '../utils/translations';

interface ZipSummaryCardProps {
  metadata: ZipMetadata;
  lang: Language;
  onReset: () => void;
  onDownloadAll: () => void;
  onOpenExportModal: () => void;
}

export const ZipSummaryCard: React.FC<ZipSummaryCardProps> = ({
  metadata,
  lang,
  onReset,
  onDownloadAll,
  onOpenExportModal,
}) => {
  const t = translations[lang];

  // Calculate savings
  const savedBytes = Math.max(0, metadata.totalSize - metadata.compressedSize);
  const ratio = metadata.totalSize > 0 
    ? Math.round(((metadata.totalSize - metadata.compressedSize) / metadata.totalSize) * 100) 
    : 0;

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* File Name & Main Tag */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-white max-w-md truncate" title={metadata.fileName}>
                {metadata.fileName}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ZIP
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'ar' ? 'أرشيف مضغوط جاهز للاستعراض والتعديل' : 'Archive loaded and ready for exploration'}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full lg:w-auto">
          {/* Total Files */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">{t.totalFiles}</div>
              <div className="text-sm font-bold text-slate-100">{metadata.totalFiles}</div>
            </div>
          </div>

          {/* Total Folders */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <FolderCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">{t.totalFolders}</div>
              <div className="text-sm font-bold text-slate-100">{metadata.totalDirs}</div>
            </div>
          </div>

          {/* Uncompressed size */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <HardDrive className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">{t.uncompressedSize}</div>
              <div className="text-sm font-bold text-slate-100">{formatBytes(metadata.totalSize)}</div>
            </div>
          </div>

          {/* Savings / Ratio */}
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2.5">
            <Percent className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-xs text-slate-400">{t.compressionRatio}</div>
              <div className="text-sm font-bold text-emerald-400">
                {ratio > 0 ? `${ratio}%` : '0%'}
              </div>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={onReset}
            className="px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition flex items-center gap-1.5"
            title={t.uploadAnother}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.uploadAnother}</span>
          </button>

          <button
            type="button"
            onClick={onOpenExportModal}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.saveZip}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
