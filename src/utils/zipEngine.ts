import JSZip from 'jszip';
import { TreeNode, ZipFileEntry, ZipMetadata } from '../types/zip';

export interface LoadedZipData {
  zip: JSZip;
  entries: ZipFileEntry[];
  tree: TreeNode;
  metadata: ZipMetadata;
}

export async function parseZipBlob(blob: Blob | File, filename?: string): Promise<LoadedZipData> {
  const zip = new JSZip();
  const loadedZip = await zip.loadAsync(blob);
  
  const entries: ZipFileEntry[] = [];
  let totalUncompressed = 0;
  let totalCompressed = 0;
  let totalFiles = 0;
  let totalDirs = 0;

  loadedZip.forEach((relativePath, zipObject) => {
    const isDir = zipObject.dir || relativePath.endsWith('/');
    const uncompressed = (zipObject as any)._data ? ((zipObject as any)._data.uncompressedSize || 0) : 0;
    const compressed = (zipObject as any)._data ? ((zipObject as any)._data.compressedSize || 0) : 0;

    totalUncompressed += uncompressed;
    totalCompressed += compressed;
    if (isDir) {
      totalDirs++;
    } else {
      totalFiles++;
    }

    const pathClean = relativePath.endsWith('/') && isDir ? relativePath.slice(0, -1) : relativePath;
    const pathParts = pathClean.split('/');
    const name = pathParts[pathParts.length - 1];

    entries.push({
      path: relativePath,
      name: name || relativePath,
      dir: isDir,
      date: zipObject.date || new Date(),
      uncompressedSize: uncompressed,
      compressedSize: compressed,
      comment: zipObject.comment,
      contentGetter: async () => await zipObject.async('uint8array'),
      textGetter: async () => await zipObject.async('string')
    });
  });

  const tree = buildTreeFromEntries(entries);

  const metadata: ZipMetadata = {
    fileName: filename || (blob instanceof File ? blob.name : 'archive.zip'),
    totalSize: totalUncompressed || blob.size,
    compressedSize: blob.size,
    totalFiles,
    totalDirs,
    comment: loadedZip.comment
  };

  return {
    zip: loadedZip,
    entries,
    tree,
    metadata
  };
}

export function buildTreeFromEntries(entries: ZipFileEntry[]): TreeNode {
  const root: TreeNode = {
    name: 'root',
    path: '',
    isDir: true,
    children: {},
    size: 0
  };

  for (const entry of entries) {
    const cleanPath = entry.path.endsWith('/') ? entry.path.slice(0, -1) : entry.path;
    const parts = cleanPath.split('/').filter(Boolean);
    let current = root;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;
      const currentPath = parts.slice(0, i + 1).join('/') + (isLast && entry.dir ? '/' : '');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: currentPath,
          isDir: isLast ? entry.dir : true,
          children: {},
          entry: isLast ? entry : undefined,
          size: isLast ? entry.uncompressedSize : 0
        };
      } else if (isLast) {
        current.children[part].entry = entry;
        current.children[part].isDir = entry.dir;
        current.children[part].size = entry.uncompressedSize;
      }

      current.size += isLast ? entry.uncompressedSize : 0;
      current = current.children[part];
    }
  }

  return root;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
