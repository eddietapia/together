import { ArrowRight } from 'lucide-react';
import type { SubmissionSummary } from '@/types/submission';
import { SubmissionCard } from './SubmissionCard';
import { matchesSubmissionFilter } from '@/lib/utils';
import {
  getSubmissionCategory,
  type SubmissionCategory,
} from '@/components/Home/submissionVisuals';
import { getSubmissionReviewPlanSummary, type ReviewRisk } from '@/lib/reviewWalkthrough';

function riskRank(risk: ReviewRisk | null): number {
  if (risk === 'high') return 0;
  if (risk === 'medium') return 1;
  if (risk === 'low') return 2;
  return 3;
}

function sortForReview(a: SubmissionSummary, b: SubmissionSummary): number {
  const aPlan = getSubmissionReviewPlanSummary(a.id);
  const bPlan = getSubmissionReviewPlanSummary(b.id);
  const byPending = Number(b.reviewProgress.pending > 0) - Number(a.reviewProgress.pending > 0);
  if (byPending !== 0) return byPending;
  const byRisk = riskRank(aPlan?.risk ?? null) - riskRank(bPlan?.risk ?? null);
  if (byRisk !== 0) return byRisk;
  return b.createdAt - a.createdAt;
}

export function SubmissionsList({
  submissions,
  loading,
  error,
  filter,
  categoryFilter,
  onOpen,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  filter: string;
  categoryFilter: SubmissionCategory | null;
  onOpen: (id: string) => void;
}) {
  const matched = submissions
    .filter(s => matchesSubmissionFilter(s, filter))
    .filter(
      s => !categoryFilter || getSubmissionCategory(s) === categoryFilter
    )
    .sort(sortForReview);
  const pending = matched.filter(s => s.status === 'pending');
  const reviewable = pending.filter(s => s.reviewProgress.pending > 0);
  const recommended = reviewable[0] ?? null;
  const remaining = recommended
    ? matched.filter(s => s.id !== recommended.id)
    : matched;
  const highAttentionCount = reviewable.filter(
    s => getSubmissionReviewPlanSummary(s.id)?.risk === 'high'
  ).length;
  const deletionCount = reviewable.filter(s => s.fileActions.deleted > 0).length;
  const fullyReviewedCount = matched.filter(
    s => s.fileCount > 0 && s.reviewProgress.pending === 0
  ).length;

  return (
    <>
      <header className="flex-shrink-0 bg-[#faf7f0] border-b border-border px-6 py-4">
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-base font-semibold text-foreground">
              Checkpoint
            </h1>
            <span className="text-xs text-muted-foreground">
              {submissions.length}{' '}
              {submissions.length === 1 ? 'checkpoint' : 'checkpoints'}
              {filter.trim() && ` · ${matched.length} matching`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {reviewable.length} checkpoints still have files awaiting validation.
          </p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-5 space-y-5">
          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse px-2 py-3">
              Loading checkpoints…
            </p>
          ) : error ? (
            <div className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <p className="text-xs text-red-800 font-medium">
                Failed to load checkpoints.
              </p>
              <p className="text-[11px] text-red-700/80 mt-0.5">{error}</p>
            </div>
          ) : matched.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {submissions.length === 0
                  ? 'No checkpoints yet.'
                  : 'No checkpoints match your filter.'}
              </p>
            </div>
          ) : (
            <>
              <section className="grid gap-3 md:grid-cols-3">
                <MetricCard label="Needs review" value={reviewable.length} />
                <MetricCard label="High attention" value={highAttentionCount} tone="red" />
                <MetricCard
                  label={fullyReviewedCount > 0 ? 'Fully reviewed' : 'Contains deletion'}
                  value={fullyReviewedCount > 0 ? fullyReviewedCount : deletionCount}
                  tone={fullyReviewedCount > 0 ? 'default' : 'amber'}
                />
              </section>

              {recommended ? (
                <SubmissionCard submission={recommended} onOpen={onOpen} featured />
              ) : (
                <section className="bg-card border border-border rounded-2xl px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">All files reviewed</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    No checkpoint currently has pending file reviews. You can still open reviewed checkpoints below.
                  </p>
                </section>
              )}

              {remaining.length > 0 && (
                <section>
                  <div className="flex items-center justify-between gap-3 mb-2 px-2">
                    <h2 className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                      {reviewable.length > 0 ? 'Review queue' : 'Reviewed checkpoints'}
                    </h2>
                    {recommended && (
                      <button
                        type="button"
                        onClick={() => onOpen(recommended.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Start recommended
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {remaining.map(s => (
                      <SubmissionCard key={s.id} submission={s} onOpen={onOpen} />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function MetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string;
  value: number;
  tone?: 'default' | 'red' | 'amber';
}) {
  const valueClass =
    tone === 'red'
      ? 'text-red-700'
      : tone === 'amber'
        ? 'text-yellow-800'
        : 'text-foreground';
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3">
      <p className={`text-lg font-semibold ${valueClass}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mt-0.5">
        {label}
      </p>
    </div>
  );
}
