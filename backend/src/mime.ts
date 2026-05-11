const EXT_TO_MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  csv: 'text/csv',
  tsv: 'text/tab-separated-values',
  json: 'application/json',
  md: 'text/markdown',
  markdown: 'text/markdown',
  txt: 'text/plain',
  log: 'text/plain',
  pdf: 'application/pdf',
  yaml: 'application/yaml',
  yml: 'application/yaml',
};

export function mimeTypeFor(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop() ?? '';
  return EXT_TO_MIME[ext] ?? 'application/octet-stream';
}
