export interface ZipFileEntry {
  path: string;
  name: string;
  dir: boolean;
  date: Date;
  uncompressedSize: number;
  compressedSize: number;
  comment?: string;
  crc32?: number;
  contentGetter?: () => Promise<Uint8Array>;
  textGetter?: () => Promise<string>;
}

export interface TreeNode {
  name: string;
  path: string;
  isDir: boolean;
  children: Record<string, TreeNode>;
  entry?: ZipFileEntry;
  size: number;
}

export type ViewMode = 'tree' | 'table' | 'grid';
export type Language = 'ar' | 'en';

export interface ZipMetadata {
  fileName: string;
  totalSize: number;
  compressedSize: number;
  totalFiles: number;
  totalDirs: number;
  lastModified?: Date;
  comment?: string;
}
