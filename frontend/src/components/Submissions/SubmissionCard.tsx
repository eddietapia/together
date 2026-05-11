import { ArrowRight, ShieldAlert } from 'lucide-react';
import type { SubmissionSummary } from '@/types/submission';
import { formatRelativeTime } from '@/lib/utils';
import { STATUS_PILL } from '@/constants/statusStyles';
import { ACTION_TONE } from '@/components/shared/ActionBadge';
import {
  getSubmissionReviewPlanSummary,
  type ReviewRisk,
  type SubmissionReviewPlanSummary,
} from '@/lib/reviewWalkthrough';
import { ShareCheckpointButton } from './ShareCheckpointButton';

const RISK_TONE: Record<ReviewRisk, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-700',
};

function riskLabel(risk: ReviewRisk): string {
  if (risk === 'high') return 'High attention';
  if (risk === 'medium') return 'Medium attention';
  return 'Low risk';
}

function reviewedCount(submission: SubmissionSummary): number {
  return submission.reviewProgress.approved + submission.reviewProgress.rejected;
}

function hasPendingFiles(submission: SubmissionSummary): boolean {
  return submission.reviewProgress.pending > 0;
}

export function SubmissionCard({
  submission,
  onOpen,
  featured = false,
}: {
  submission: SubmissionSummary;
  onOpen: (id: string) => void;
  featured?: boolean;
}) {
  const plan = getSubmissionReviewPlanSummary(submission.id);

  if (featured) {
    return <FeaturedSubmissionCard submission={submission} onOpen={onOpen} plan={plan} />;
  }

  const { fileActions } = submission;
  const needsReview = hasPendingFiles(submission);
  return (
    <div className="group bg-card border border-border rounded-xl hover:shadow-sm hover:border-foreground/15 transition-all">
      <button
        onClick={() => onOpen(submission.id)}
        className="w-full text-left px-4 py-3"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <ReviewStateChip submission={submission} />
              {needsReview && plan && <RiskChip risk={plan.risk} />}
              <span className="text-[11px] text-muted-foreground">{submission.id}</span>
            </div>
            <h3 className="text-sm font-semibold text-foreground leading-snug">
              {submission.title}
            </h3>
            {submission.description && (
              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                {submission.description}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-muted-foreground">
              <span>{submission.fileCount} {submission.fileCount === 1 ? 'file' : 'files'}</span>
              <span>{reviewedCount(submission)}/{submission.fileCount} reviewed</span>
              <FileChips actions={fileActions} />
              {needsReview && plan?.steps[0] && (
                <span className="truncate">Next: {plan.steps[0].title}</span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-[11px] text-muted-foreground/70">
              {formatRelativeTime(new Date(submission.createdAt))}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {needsReview ? 'Review' : 'Open'}
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </button>
      <div className="flex justify-end border-t border-border/60 px-3 py-1.5">
        <ShareCheckpointButton submissionId={submission.id} />
      </div>
    </div>
  );
}

function FeaturedSubmissionCard({
  submission,
  onOpen,
  plan,
}: {
  submission: SubmissionSummary;
  onOpen: (id: string) => void;
  plan: SubmissionReviewPlanSummary | null;
}) {
  const needsReview = hasPendingFiles(submission);
  return (
    <section className="bg-card border border-foreground/15 rounded-2xl p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-foreground bg-black/5 px-2 py-1 rounded-full">
              <ShieldAlert className="w-3 h-3" />
              Recommended next
            </span>
            {needsReview && plan && <RiskChip risk={plan.risk} />}
            <span className="text-[11px] text-muted-foreground">{submission.id}</span>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground leading-tight">
            {submission.title}
          </h2>
          {submission.description && (
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              {submission.description}
            </p>
          )}
          {plan && (
            <p className="text-xs text-foreground/80 mt-3 leading-relaxed bg-black/5 rounded-lg px-3 py-2">
              {plan.primaryQuestion}
            </p>
          )}
        </div>

        <div className="lg:w-72 flex-shrink-0">
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => onOpen(submission.id)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            >
              {needsReview ? 'Start review' : 'Open checkpoint'}
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="flex justify-center">
              <ShareCheckpointButton submissionId={submission.id} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{reviewedCount(submission)}/{submission.fileCount} reviewed</span>
            <span>{formatRelativeTime(new Date(submission.createdAt))}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-foreground/70"
              style={{
                width: `${submission.fileCount === 0 ? 0 : (reviewedCount(submission) / submission.fileCount) * 100}%`,
              }}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FileChips actions={submission.fileActions} />
          </div>
        </div>
      </div>

      {plan && (
        <div className="mt-5 grid gap-2 md:grid-cols-3">
          {plan.steps.slice(0, 3).map((step, index) => (
            <div key={step.title} className="rounded-lg border border-border bg-[#fffdf7] px-3 py-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                {index + 1}. {step.kicker}
              </p>
              <p className="text-xs font-medium text-foreground mt-1 leading-snug">
                {step.title}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ReviewStateChip({ submission }: { submission: SubmissionSummary }) {
  if (submission.status === 'merged') {
    return (
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${STATUS_PILL.merged}`}>
        merged
      </span>
    );
  }

  if (!hasPendingFiles(submission)) {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider bg-green-100 text-green-700">
        reviewed
      </span>
    );
  }

  return (
    <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider ${STATUS_PILL[submission.status]}`}>
      {submission.status}
    </span>
  );
}

function RiskChip({ risk }: { risk: ReviewRisk }) {
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${RISK_TONE[risk]}`}>
      {riskLabel(risk)}
    </span>
  );
}

function FileChips({ actions }: { actions: SubmissionSummary['fileActions'] }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {actions.created > 0 && <FileChip count={actions.created} action="created" />}
      {actions.updated > 0 && <FileChip count={actions.updated} action="updated" />}
      {actions.deleted > 0 && <FileChip count={actions.deleted} action="deleted" />}
    </span>
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
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${tone}`}>
      {symbol}
      {count}
    </span>
  );
}
