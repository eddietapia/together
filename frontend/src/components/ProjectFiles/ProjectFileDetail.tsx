import { useEffect, useState } from 'react';
import type { FileLeaf } from '@/types/project';
import { fetchProjectFileText } from '@/api/projectFiles';
import { formatBytes, formatRelativeTime } from '@/lib/utils';

export function ProjectFileDetail({ file }: { file: FileLeaf }) {
  const [text, setText] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setText(null);
    fetchProjectFileText(file.path)
      .then(t => { if (!cancelled) { setText(t); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err instanceof Error ? err.message : String(err)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [file.path]);

  const isImage = file.mimeType.startsWith('image/');

  return (
    <section className="rounded-xl border border-black/5 bg-[#fffdf7] shadow-[0_4px_16px_hsla(25,25%,35%,0.06)] flex flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <span className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
          {file.name}
        </span>
        <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">
          {formatBytes(file.size)}
        </span>
        {file.mergedAt && (
          <span className="text-[10px] text-muted-foreground/60 flex-shrink-0">
            {formatRelativeTime(new Date(file.mergedAt))}
          </span>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 min-h-0 max-h-[480px]">
        {loading ? (
          <p className="text-xs text-muted-foreground animate-pulse">Loading…</p>
        ) : error ? (
          <p className="text-xs text-red-700/80">{error}</p>
        ) : isImage ? (
          <img
            src={`/api/project-files/content?path=${encodeURIComponent(file.path)}`}
            alt={file.name}
            className="max-w-full rounded"
            draggable={false}
          />
        ) : (
          <pre className="text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words font-mono">
            {text}
          </pre>
        )}
      </div>
    </section>
  );
}
