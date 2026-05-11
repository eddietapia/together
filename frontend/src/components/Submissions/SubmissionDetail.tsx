import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import type {
  SubmissionDetail as SubmissionDetailType,
  SubmissionFile,
} from '@/types/submission';
import { fetchSubmission } from '@/api/submissions';
import { formatRelativeTime } from '@/lib/utils';
import { STATUS_PILL } from '@/constants/statusStyles';
import { FileRow } from './FileRow';
import { ReviewWalkthrough } from './ReviewWalkthrough';
import {
  getSubmissionWalkthrough,
  type SubmissionWalkthrough,
  type WalkthroughStep,
} from '@/lib/reviewWalkthrough';

export function SubmissionDetail({
  submissionId,
  onBack,
}: {
  submissionId: string;
  onBack: () => void;
}) {
  const [data, setData] = useState<SubmissionDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [activeStepId, setActiveStepId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchSubmission(submissionId)
      .then(d => {
        if (!cancelled) {
          setData(d);
          setActiveStepId(null);
          setExpandedFileId(null);
        }
      })
      .catch(err => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : String(err));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [submissionId]);

  const walkthrough = useMemo<SubmissionWalkthrough | null>(
    () => (data ? getSubmissionWalkthrough(data.submission, data.files) : null),
    [data],
  );

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 };
    if (data) for (const f of data.files) c[f.status] += 1;
    return c;
  }, [data]);

  function applyFileUpdate(updated: SubmissionFile) {
    setData(prev =>
      prev
        ? {
            ...prev,
            files: prev.files.map(f => (f.id === updated.id ? updated : f)),
          }
        : prev,
    );
  }

  function handleSelectStep(step: WalkthroughStep) {
    setActiveStepId(step.id);
    setExpandedFileId(null);
  }

  function handleToggleFile(fileId: string) {
    setExpandedFileId(prev => (prev === fileId ? null : fileId));
  }

  return (
    <>
      <header className="flex-shrink-0 bg-[#faf7f0] border-b border-border px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          All checkpoints
        </button>
        {data && (
          <>
            <div className="flex items-baseline gap-3">
              <h1 className="text-lg font-semibold text-foreground leading-tight">
                {data.submission.title}
              </h1>
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  STATUS_PILL[data.submission.status]
                }`}
              >
                {data.submission.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.submission.id} · by {data.submission.author ?? 'unknown'} ·{' '}
              {formatRelativeTime(new Date(data.submission.createdAt))}
            </p>
          </>
        )}
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-5 space-y-5">
          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse px-2 py-3">
              Loading checkpoint…
            </p>
          ) : error ? (
            <div className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <p className="text-xs text-red-800 font-medium">Failed to load.</p>
              <p className="text-[11px] text-red-700/80 mt-0.5">{error}</p>
            </div>
          ) : data ? (
            <>
              {data.submission.description && (
                <section className="bg-card border border-border rounded-xl p-4">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1">
                    Agent claim
                  </p>
                  <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                    {data.submission.description}
                  </p>
                </section>
              )}

              {walkthrough && walkthrough.steps.length > 0 && (
                <ReviewWalkthrough
                  walkthrough={walkthrough}
                  files={data.files}
                  activeStepId={activeStepId ?? walkthrough.steps[0]?.id ?? null}
                  expandedFileId={expandedFileId}
                  onSelectStep={handleSelectStep}
                  onToggleFile={handleToggleFile}
                  onUpdatedFile={applyFileUpdate}
                />
              )}

              <section>
                <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2 px-2">
                  All evidence files ({data.files.length})
                </h2>
                <div className="space-y-1.5">
                  {data.files.map(f => (
                    <FileRow
                      key={f.id}
                      file={f}
                      expanded={expandedFileId === f.id}
                      onToggle={() => handleToggleFile(f.id)}
                      onUpdated={applyFileUpdate}
                    />
                  ))}
                </div>
              </section>

              <section className="flex items-center gap-2 pt-2 border-t border-border">
                <DisabledAction label="Merge checkpoint" />
                <p className="text-[11px] text-muted-foreground/70 ml-auto">
                  {counts.approved} approved · {counts.pending} pending ·{' '}
                  {counts.rejected} rejected
                </p>
              </section>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}

function DisabledAction({ label }: { label: string }) {
  return (
    <button
      type="button"
      disabled
      className="px-3 py-1.5 text-xs font-medium bg-foreground/5 text-muted-foreground/60 rounded-md border border-border cursor-not-allowed"
    >
      {label}
    </button>
  );
}
