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
  const [manualExpandedFileId, setManualExpandedFileId] = useState<string | null>(null);
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
          setManualExpandedFileId(null);
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

  const activeStep = useMemo(() => {
    if (!walkthrough) return null;
    return walkthrough.steps.find(step => step.id === activeStepId) ?? walkthrough.steps[0] ?? null;
  }, [activeStepId, walkthrough]);

  useEffect(() => {
    if (!walkthrough || !data || activeStepId !== null) return;
    const firstStep = walkthrough.steps[0];
    if (!firstStep) return;
    setActiveStepId(firstStep.id);
    setExpandedFileId(firstPendingFileId(firstStep, data.files));
  }, [activeStepId, data, walkthrough]);

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

  function firstPendingFileId(step: WalkthroughStep, files: SubmissionFile[]): string | null {
    const fileById = new Map(files.map(file => [file.id, file]));
    return step.fileIds.find(fileId => fileById.get(fileId)?.status === 'pending') ?? step.fileIds[0] ?? null;
  }

  function handleSelectStep(step: WalkthroughStep) {
    setActiveStepId(step.id);
    setExpandedFileId(firstPendingFileId(step, data?.files ?? []));
  }

  function handleToggleGuidedFile(fileId: string) {
    const step = walkthrough?.steps.find(s => s.fileIds.includes(fileId));
    if (step && step.id !== activeStepId) setActiveStepId(step.id);
    setExpandedFileId(prev => (prev === fileId ? null : fileId));
  }

  function handleGuidedFileUpdate(updated: SubmissionFile) {
    applyFileUpdate(updated);

    if (!walkthrough || !data || updated.status === 'pending') return;

    const nextFiles = data.files.map(file => (file.id === updated.id ? updated : file));
    const fileById = new Map(nextFiles.map(file => [file.id, file]));
    const currentStep =
      activeStep ?? walkthrough.steps.find(step => step.fileIds.includes(updated.id));
    if (!currentStep) {
      setExpandedFileId(null);
      return;
    }

    const currentFileIndex = currentStep.fileIds.indexOf(updated.id);
    const nextInStep = currentStep.fileIds
      .slice(currentFileIndex + 1)
      .find(fileId => fileById.get(fileId)?.status === 'pending');
    if (nextInStep) {
      setExpandedFileId(nextInStep);
      return;
    }

    const currentStepIndex = walkthrough.steps.findIndex(step => step.id === currentStep.id);
    const nextStep = walkthrough.steps
      .slice(currentStepIndex + 1)
      .find(step => step.fileIds.some(fileId => fileById.get(fileId)?.status === 'pending'));

    if (nextStep) {
      setActiveStepId(nextStep.id);
      setExpandedFileId(firstPendingFileId(nextStep, nextFiles));
      return;
    }

    setExpandedFileId(null);
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
                  onToggleFile={handleToggleGuidedFile}
                  onUpdatedFile={handleGuidedFileUpdate}
                />
              )}

              <section>
                <div className="mb-2 px-2">
                  <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                    All evidence files ({data.files.length})
                  </h2>
                  <p className="mt-1 text-[11px] text-muted-foreground/80">
                    Skip the walkthrough and review any file directly.
                  </p>
                </div>
                <div className="space-y-1.5">
                  {data.files.map(f => (
                    <FileRow
                      key={f.id}
                      file={f}
                      expanded={manualExpandedFileId === f.id}
                      onToggle={() =>
                        setManualExpandedFileId(prev => (prev === f.id ? null : f.id))
                      }
                      onUpdated={updated => {
                        applyFileUpdate(updated);
                        if (updated.status !== 'pending') setManualExpandedFileId(null);
                      }}
                      insight={walkthrough?.fileInsights[f.id]}
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
