import { ExternalLink } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  fetchProjectFileText,
  projectFileContentUrl,
} from '@/api/projectFiles';
import type { FileLeaf } from '@/types/project';
import { formatBytes, formatRelativeTime } from '@/lib/utils';
import { ActionBadge } from '@/components/shared/ActionBadge';
import { fileKindFor } from '@/components/FilePreview/fileType';
import {
  PreviewError,
  PreviewLoading,
  PreviewMissing,
} from '@/components/FilePreview/PreviewShell';

export function ProjectFileDetail({ file }: { file: FileLeaf | null }) {
  if (!file) return null;

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border bg-[#fffdf7]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
              File preview
            </p>
            <h2 className="text-sm font-semibold text-foreground mt-1 truncate">
              {file.name}
            </h2>
            <p className="text-[11px] text-muted-foreground/80 mt-0.5 truncate">
              {file.path}
            </p>
          </div>
          <a
            href={projectFileContentUrl(file.path)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border text-foreground rounded-md hover:bg-black/5 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Open
          </a>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] text-muted-foreground">
          <span>{formatBytes(file.size)}</span>
          <span aria-hidden>·</span>
          <span>{file.mimeType}</span>
          {file.action && <ActionBadge action={file.action} />}
          {file.sourceSubmissionTitle && (
            <span className="truncate">from {file.sourceSubmissionTitle}</span>
          )}
          {file.mergedAt && <span>{formatRelativeTime(new Date(file.mergedAt))}</span>}
        </div>
      </div>

      <div className="p-4">
        <ProjectFilePreview file={file} />
      </div>
    </section>
  );
}

function ProjectFilePreview({ file }: { file: FileLeaf }) {
  const kind = fileKindFor({ filename: file.name, mimeType: file.mimeType });
  const url = projectFileContentUrl(file.path);

  if (kind === 'image') {
    return (
      <div className="flex items-center justify-center bg-[#fffdf7] border border-border rounded-md p-2">
        <img
          src={url}
          alt={file.name}
          className="max-h-[520px] w-auto object-contain"
          draggable={false}
        />
      </div>
    );
  }

  if (kind === 'pdf') {
    return (
      <iframe
        src={url}
        title={file.name}
        className="h-[560px] w-full rounded-md border border-border bg-white"
      />
    );
  }

  if (kind === 'csv' || kind === 'json' || kind === 'markdown' || kind === 'text') {
    return <ProjectTextPreview file={file} />;
  }

  return <PreviewMissing label={`No inline preview for ${file.mimeType}`} />;
}

function ProjectTextPreview({ file }: { file: FileLeaf }) {
  const [state, setState] = useState<{
    text: string | null;
    loading: boolean;
    error: string | null;
  }>({ text: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ text: null, loading: true, error: null });
    fetchProjectFileText(file.path)
      .then(text => {
        if (!cancelled) setState({ text, loading: false, error: null });
      })
      .catch(err => {
        if (!cancelled) {
          setState({
            text: null,
            loading: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [file.path]);

  if (state.loading) return <PreviewLoading />;
  if (state.error) return <PreviewError message={state.error} />;

  return (
    <pre className="text-[11px] font-mono leading-relaxed bg-white border border-border rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-[560px] overflow-y-auto">
      {state.text}
    </pre>
  );
}
