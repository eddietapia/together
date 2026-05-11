import type { SubmissionSummary } from '@/types/submission';
import { SubmissionCard } from './SubmissionCard';
import { matchesSubmissionFilter } from '@/lib/utils';

export function SubmissionsList({
  submissions,
  loading,
  error,
  filter,
  onOpen,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  filter: string;
  onOpen: (id: string) => void;
}) {
  const matched = submissions.filter(s => matchesSubmissionFilter(s, filter));

  return (
    <>
      <header className="flex-shrink-0 bg-[#faf7f0] border-b border-border px-6 py-4">
        <div className="flex items-baseline gap-3">
          <h1 className="text-base font-semibold text-foreground">
            Submissions
          </h1>
          <span className="text-xs text-muted-foreground">
            {submissions.length}{' '}
            {submissions.length === 1 ? 'submission' : 'submissions'}
            {filter.trim() && ` · ${matched.length} matching`}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Pending agent submissions awaiting review.
        </p>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-5 space-y-3">
          {loading ? (
            <p className="text-xs text-muted-foreground animate-pulse px-2 py-3">
              Loading submissions…
            </p>
          ) : error ? (
            <div className="px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
              <p className="text-xs text-red-800 font-medium">
                Failed to load submissions.
              </p>
              <p className="text-[11px] text-red-700/80 mt-0.5">{error}</p>
            </div>
          ) : matched.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {submissions.length === 0
                  ? 'No submissions yet.'
                  : 'No submissions match your filter.'}
              </p>
            </div>
          ) : (
            matched.map(s => (
              <SubmissionCard key={s.id} submission={s} onOpen={onOpen} />
            ))
          )}
        </div>
      </div>
    </>
  );
}
