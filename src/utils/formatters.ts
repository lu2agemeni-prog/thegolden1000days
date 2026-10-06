export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(date: Date, lang: 'ar' | 'en' = 'ar'): string {
  try {
    return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

export function getFileExtension(path: string): string {
  const parts = path.split('/');
  const fileName = parts[parts.length - 1];
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return fileName.slice(lastDot + 1).toLowerCase();
}

export function getParentPath(path: string): string {
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
  const lastSlash = cleanPath.lastIndexOf('/');
  if (lastSlash === -1) return '';
  return cleanPath.slice(0, lastSlash + 1);
}
