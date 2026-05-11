import type { SubmissionSummary } from '@/types/submission';
import { formatRelativeTime } from '@/lib/utils';
import { STATUS_PILL } from '@/constants/statusStyles';
import { ACTION_TONE } from '@/components/shared/ActionBadge';

export function SubmissionCard({
  submission,
  onOpen,
}: {
  submission: SubmissionSummary;
  onOpen: (id: string) => void;
}) {
  const { fileActions } = submission;
  return (
    <button
      onClick={() => onOpen(submission.id)}
      className="w-full text-left bg-card border border-border rounded-xl px-5 py-4 hover:shadow-sm hover:border-foreground/15 transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                STATUS_PILL[submission.status]
              }`}
            >
              {submission.status}
            </span>
            <span className="text-[11px] text-muted-foreground">
              {submission.id}
            </span>
          </div>
          <h3 className="text-base font-semibold text-foreground leading-snug">
            {submission.title}
          </h3>
          {submission.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {submission.description}
            </p>
          )}
        </div>
        <span className="text-[11px] text-muted-foreground/70 flex-shrink-0 mt-0.5">
          {formatRelativeTime(new Date(submission.createdAt))}
        </span>
      </div>

      <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
        <span>by {submission.author ?? 'unknown'}</span>
        <span aria-hidden>·</span>
        <span>
          {submission.fileCount}{' '}
          {submission.fileCount === 1 ? 'file' : 'files'}
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          {fileActions.created > 0 && (
            <FileChip count={fileActions.created} action="created" />
          )}
          {fileActions.updated > 0 && (
            <FileChip count={fileActions.updated} action="updated" />
          )}
          {fileActions.deleted > 0 && (
            <FileChip count={fileActions.deleted} action="deleted" />
          )}
        </div>
      </div>
    </button>
  );
}

function FileChip({
  count,
  action,
}: {
  count: number;
  action: 'created' | 'updated' | 'deleted';
}) {
  const tone = ACTION_TONE[action] ?? '';
  const symbol = action === 'created' ? '+' : action === 'updated' ? '~' : '−';
  return (
    <span
      className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tone}`}
    >
      {symbol}
      {count}
    </span>
  );
}
