import { useState } from 'react';
import type { ReviewStatus, SubmissionFile } from '@/types/submission';
import { updateSubmissionFileStatus } from '@/api/submissions';
import { REVIEW_PILL } from '@/constants/statusStyles';

export function ReviewActions({
  file,
  onUpdated,
}: {
  file: SubmissionFile;
  onUpdated: (f: SubmissionFile) => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [comment, setComment] = useState('');

  async function submitStatus(status: ReviewStatus, c?: string) {
    setPending(true);
    setError(null);
    try {
      const updated = await updateSubmissionFileStatus(
        file.submissionId,
        file.id,
        status,
        c,
      );
      onUpdated(updated);
      setRejecting(false);
      setComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  if (file.status !== 'pending') {
    return (
      <div className="flex items-center gap-3 pt-2 border-t border-border/60">
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase tracking-wider ${
            REVIEW_PILL[file.status]
          }`}
        >
          {file.status}
        </span>
        {file.status === 'rejected' && file.reviewComment && (
          <p className="text-xs text-muted-foreground italic flex-1">
            "{file.reviewComment}"
          </p>
        )}
        <button
          type="button"
          onClick={() => submitStatus('pending')}
          disabled={pending}
          className="text-[11px] text-muted-foreground hover:text-foreground transition-colors ml-auto disabled:opacity-50"
        >
          Reset
        </button>
      </div>
    );
  }

  if (rejecting) {
    return (
      <div className="space-y-2 pt-2 border-t border-border/60">
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Comment required to reject…"
          rows={2}
          autoFocus
          className="w-full px-2.5 py-1.5 text-xs bg-white border border-border rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
        />
        {error && <p className="text-[11px] text-red-700">{error}</p>}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={pending || comment.trim() === ''}
            onClick={() => submitStatus('rejected', comment)}
            className="px-3 py-1.5 text-xs font-medium bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirm reject
          </button>
          <button
            type="button"
            onClick={() => {
              setRejecting(false);
              setComment('');
              setError(null);
            }}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 pt-2 border-t border-border/60">
      <button
        type="button"
        disabled={pending}
        onClick={() => submitStatus('approved')}
        className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
      >
        Approve
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setRejecting(true)}
        className="px-3 py-1.5 text-xs font-medium bg-white border border-border text-foreground rounded-md hover:bg-black/5 transition-colors disabled:opacity-50"
      >
        Reject
      </button>
      {error && <p className="text-[11px] text-red-700 ml-2">{error}</p>}
    </div>
  );
}
