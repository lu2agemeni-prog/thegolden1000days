import React from 'react';
import {
  FileText,
  FileCode,
  Image,
  Film,
  Music,
  Archive,
  FileSpreadsheet,
  Folder,
  File,
  Code2,
  Database,
  FileQuestion
} from 'lucide-react';
import { getFileExtension } from './formatters';

export type FileCategory = 'code' | 'image' | 'text' | 'archive' | 'audio' | 'video' | 'data' | 'pdf' | 'other';

export function getFileCategory(filename: string): FileCategory {
  const ext = getFileExtension(filename);
  
  if (['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) {
    return 'image';
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'scss', 'json', 'yaml', 'yml', 'xml', 'sql', 'sh', 'bash', 'c', 'cpp', 'rs', 'go', 'php', 'java', 'vue', 'svelte'].includes(ext)) {
    return 'code';
  }
  if (['txt', 'md', 'markdown', 'log', 'rtf', 'ini', 'conf', 'env'].includes(ext)) {
    return 'text';
  }
  if (['pdf'].includes(ext)) {
    return 'pdf';
  }
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac'].includes(ext)) {
    return 'audio';
  }
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
    return 'video';
  }
  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2'].includes(ext)) {
    return 'archive';
  }
  if (['csv', 'xlsx', 'xls'].includes(ext)) {
    return 'data';
  }
  return 'other';
}

export function getFileIcon(filename: string, isDir: boolean, className: string = 'w-4 h-4'): React.ReactElement {
  if (isDir) {
    return <Folder className={`${className} text-amber-400 fill-amber-400/20`} />;
  }

  const category = getFileCategory(filename);
  const ext = getFileExtension(filename);

  switch (category) {
    case 'image':
      return <Image className={`${className} text-emerald-400`} />;
    case 'code':
      if (['json', 'sql', 'yaml', 'yml'].includes(ext)) {
        return <Database className={`${className} text-cyan-400`} />;
      }
      return <Code2 className={`${className} text-indigo-400`} />;
    case 'text':
      return <FileText className={`${className} text-blue-400`} />;
    case 'pdf':
      return <FileText className={`${className} text-rose-500`} />;
    case 'audio':
      return <Music className={`${className} text-purple-400`} />;
    case 'video':
      return <Film className={`${className} text-pink-400`} />;
    case 'archive':
      return <Archive className={`${className} text-amber-500`} />;
    case 'data':
      return <FileSpreadsheet className={`${className} text-emerald-500`} />;
    default:
      return <File className={`${className} text-slate-400`} />;
  }
}
