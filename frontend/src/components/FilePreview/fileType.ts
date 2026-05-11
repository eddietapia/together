import type { SubmissionFile } from '@/types/submission';

export type FileKind =
  | 'image'
  | 'csv'
  | 'json'
  | 'markdown'
  | 'text'
  | 'pdf'
  | 'binary';

const EXT_TO_KIND: Record<string, FileKind> = {
  png: 'image',
  jpg: 'image',
  jpeg: 'image',
  gif: 'image',
  webp: 'image',
  svg: 'image',
  csv: 'csv',
  tsv: 'csv',
  json: 'json',
  md: 'markdown',
  markdown: 'markdown',
  txt: 'text',
  log: 'text',
  yaml: 'text',
  yml: 'text',
  pdf: 'pdf',
};

export function fileKindFor(file: {
  filename: string;
  mimeType: string | null;
}): FileKind {
  const mime = file.mimeType ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'application/json') return 'json';
  if (mime === 'text/csv' || mime === 'text/tab-separated-values') return 'csv';
  if (mime === 'text/markdown') return 'markdown';
  if (mime.startsWith('text/')) return 'text';
  if (mime === 'application/yaml') return 'text';

  const ext = file.filename.toLowerCase().split('.').pop() ?? '';
  return EXT_TO_KIND[ext] ?? 'binary';
}

export function isTextKind(kind: FileKind): boolean {
  return (
    kind === 'csv' ||
    kind === 'json' ||
    kind === 'markdown' ||
    kind === 'text'
  );
}

export function isDiffableKind(kind: FileKind): boolean {
  return isTextKind(kind);
}

export function describeKind(file: SubmissionFile): string {
  const kind = fileKindFor(file);
  if (kind === 'binary') return file.mimeType ?? 'binary file';
  return kind;
}
