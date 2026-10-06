import React, { useRef } from 'react';
import {
  Search,
  FolderTree,
  List,
  LayoutGrid,
  FilePlus,
  FolderPlus,
  Download,
  Trash2,
  X,
  Languages,
  CheckSquare
} from 'lucide-react';
import { ViewMode, Language } from '../types/zip';
import { translations } from '../utils/translations';

interface ZipToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  selectedCount: number;
  onDownloadSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onAddNewFile: (file: File) => void;
  onOpenNewItemModal: (type: 'file' | 'folder') => void;
  lang: Language;
  onToggleLang: () => void;
}

export const ZipToolbar: React.FC<ZipToolbarProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  selectedCount,
  onDownloadSelected,
  onDeleteSelected,
  onClearSelection,
  onSelectAll,
  onAddNewFile,
  onOpenNewItemModal,
  lang,
  onToggleLang,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddNewFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileSelected}
      />

      {/* Left side: Search & Selection indicators */}
      <div className="flex flex-1 items-center gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search className={`w-4 h-4 text-slate-400 absolute top-1/2 -translate-y-1/2 ${lang === 'ar' ? 'right-3' : 'left-3'}`} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t.searchPlaceholder}
            className={`w-full bg-slate-950/70 border border-slate-800 focus:border-indigo-500 rounded-xl py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition ${
              lang === 'ar' ? 'pr-9 pl-9' : 'pl-9 pr-9'
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className={`absolute top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white ${lang === 'ar' ? 'left-2.5' : 'right-2.5'}`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {selectedCount > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium animate-fadeIn">
            <span>{selectedCount} {t.itemsSelected}</span>
            <button
              type="button"
              onClick={onDownloadSelected}
              className="p-1 hover:text-white transition"
              title={t.downloadSelected}
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
            </button>
            <button
              type="button"
              onClick={onDeleteSelected}
              className="p-1 hover:text-rose-400 transition"
              title={t.delete}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="p-1 hover:text-slate-200 transition"
              title={t.clearSelection}
            >
              <X className="w-3 h-3 text-slate-400" />
            </button>
          </div>
        )}
      </div>

      {/* Right side: Operations & View Mode switcher */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Add File / Folder Buttons */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          title={t.addNewFile}
        >
          <FilePlus className="w-3.5 h-3.5 text-emerald-400" />
          <span>{t.addNewFile}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNewItemModal('file')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          title={t.creatingNewFile}
        >
          <span>{lang === 'ar' ? 'ملف جديد' : 'New File'}</span>
        </button>

        <button
          type="button"
          onClick={() => onOpenNewItemModal('folder')}
          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          title={t.newFolder}
        >
          <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
          <span>{t.newFolder}</span>
        </button>

        <div className="w-px h-6 bg-slate-800 hidden sm:block" />

        {/* View Mode Switcher */}
        <div className="flex items-center bg-slate-950/70 border border-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => onViewModeChange('tree')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'tree' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t.viewTree}
          >
            <FolderTree className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('table')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t.viewTable}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            className={`p-1.5 rounded-lg transition ${
              viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
            title={t.viewGrid}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>

        {/* Language switch */}
        <button
          type="button"
          onClick={onToggleLang}
          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition flex items-center gap-1.5"
          title={lang === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
        >
          <Languages className="w-3.5 h-3.5 text-indigo-400" />
          <span>{lang === 'ar' ? 'English' : 'عربي'}</span>
        </button>
      </div>
    </div>
  );
};
