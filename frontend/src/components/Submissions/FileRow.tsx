import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SubmissionFile } from '@/types/submission';
import { ActionBadge } from '@/components/shared/ActionBadge';
import { FilePreview } from '@/components/FilePreview/FilePreview';
import { FileDiff } from '@/components/FilePreview/FileDiff';
import { formatBytes } from '@/lib/utils';
import { REVIEW_PILL } from '@/constants/statusStyles';
import { ReviewActions } from './ReviewActions';
import type { FileReviewInsight } from '@/lib/reviewWalkthrough';

type ViewMode = 'preview' | 'diff';

function ViewTab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'bg-black/5 text-muted-foreground hover:bg-black/10'
      }`}
    >
      {label}
    </button>
  );
}

export function FileRow({
  file,
  expanded,
  onToggle,
  onUpdated,
  insight,
}: {
  file: SubmissionFile;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (f: SubmissionFile) => void;
  insight?: FileReviewInsight;
}) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    file.action === 'updated' ? 'diff' : 'preview',
  );

  const previewVersion = file.action === 'deleted' ? 'current' : 'proposed';

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full text-left px-4 py-3 hover:bg-black/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ChevronDown
            className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${
              expanded ? '' : '-rotate-90'
            }`}
          />
          <ActionBadge action={file.action} />
          <span className="font-mono text-sm text-foreground truncate flex-1 min-w-0">
            {file.filename}
          </span>
          {file.status !== 'pending' && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                REVIEW_PILL[file.status]
              }`}
            >
              {file.status}
            </span>
          )}
          {file.size != null && (
            <span className="text-[10px] text-muted-foreground/70 flex-shrink-0">
              {formatBytes(file.size)}
            </span>
          )}
        </div>
        <p className="text-[11px] text-muted-foreground/80 mt-1 ml-7 truncate">
          → {file.targetPath}
        </p>
        {file.message && !expanded && (
          <p className="text-xs text-muted-foreground mt-2 ml-7 italic leading-relaxed">
            {file.message}
          </p>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-border/60 bg-[#fffdf7]/60">
          {insight && (
            <div className="pt-3 rounded-md border border-border bg-white px-3 py-2 space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                {insight.role}
              </p>
              <p className="text-xs text-foreground leading-relaxed">{insight.reviewerFocus}</p>
              <p className="text-[11px] text-muted-foreground/80 italic">{insight.value}</p>
              {insight.evidence.length > 0 && (
                <ul className="space-y-0.5">
                  {insight.evidence.map(e => (
                    <li key={e} className="text-[11px] text-muted-foreground/70 flex gap-1.5">
                      <span aria-hidden>·</span>
                      {e}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
          {file.message && (
            <p className="text-xs text-muted-foreground italic leading-relaxed pt-3">
              {file.message}
            </p>
          )}

          {file.action === 'deleted' && (
            <div className="text-[11px] text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-1.5">
              This file will be deleted on merge. Showing the current version.
            </div>
          )}

          {file.action === 'updated' && (
            <div className="flex items-center gap-1">
              <ViewTab
                label="Diff"
                active={viewMode === 'diff'}
                onClick={() => setViewMode('diff')}
              />
              <ViewTab
                label="Preview"
                active={viewMode === 'preview'}
                onClick={() => setViewMode('preview')}
              />
            </div>
          )}

          <div className="pt-1">
            {file.action === 'updated' && viewMode === 'diff' ? (
              <FileDiff file={file} />
            ) : (
              <FilePreview file={file} version={previewVersion} />
            )}
          </div>

          <ReviewActions file={file} onUpdated={onUpdated} />
        </div>
      )}
    </div>
  );
}
