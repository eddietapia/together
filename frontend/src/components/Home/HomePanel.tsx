import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import type { SubmissionSummary } from '@/types/submission';
import { formatSubmittedDate, matchesSubmissionFilter } from '@/lib/utils';
import { StatsPanel } from './StatsPanel';
import {
  CATEGORY_VISUALS,
  getSubmissionCategory,
  type SubmissionCategory,
} from './submissionVisuals';

function shortId(id: string): string {
  // submission_1 → S1
  const match = id.match(/(\d+)$/);
  return match ? `S${match[1]}` : id;
}

function getHomeSummary(submissions: SubmissionSummary[]): string {
  const total = submissions.length;
  const needsReview = submissions.filter(s => s.reviewProgress.pending > 0).length;

  if (total === 0) return 'No checkpoints yet.';
  if (needsReview === 0) return 'All caught up. Every checkpoint file has been reviewed.';

  return `${needsReview} checkpoints still need file review. The newest re-runs the analysis after flagging sample S07 as an outlier.`;
}

export function HomePanel({
  submissions,
  loading,
  error,
  onOpenSubmission,
  searchFilter,
  categoryFilter,
  onCategoryFilterChange,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  onOpenSubmission: (id: string) => void;
  searchFilter: string;
  categoryFilter: SubmissionCategory | null;
  onCategoryFilterChange: (category: SubmissionCategory | null) => void;
}) {
  if (loading) {
    return (
      <p className="text-xs text-muted-foreground px-4 py-3 animate-pulse">
        Loading…
      </p>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-3">
        <p className="text-[11px] text-red-700/80">{error}</p>
      </div>
    );
  }

  const visibleSubmissions = submissions
    .filter(s => matchesSubmissionFilter(s, searchFilter))
    .filter(
      s => !categoryFilter || getSubmissionCategory(s) === categoryFilter
    );
  const pending = visibleSubmissions.filter(s => s.reviewProgress.pending > 0);
  const reviewed = visibleSubmissions.filter(
    s => s.fileCount > 0 && s.reviewProgress.pending === 0 && s.status !== 'merged'
  );
  const merged = visibleSubmissions.filter(s => s.status === 'merged');
  const reviewedCount = reviewed.length + merged.length;
  const isFiltered = !!searchFilter.trim() || categoryFilter !== null;

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <section className="px-4 pt-4 pb-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5">
          Summary
        </p>
        <p className="text-[11px] text-foreground/75 leading-relaxed">
          {getHomeSummary(submissions)}
        </p>
      </section>

      {isFiltered && (
        <section className="px-4 pb-3">
          <div className="rounded-lg bg-black/5 px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/65 font-medium">
              Active filters
            </p>
            <p className="mt-1 text-[11px] text-foreground/75 leading-snug">
              {categoryFilter ? CATEGORY_VISUALS[categoryFilter].label : 'All risk'}
              {searchFilter.trim() ? ` · ${searchFilter.trim()}` : ''}
            </p>
            {categoryFilter && (
              <button
                type="button"
                onClick={() => onCategoryFilterChange(null)}
                className="mt-1 text-[10px] font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear risk filter
              </button>
            )}
          </div>
        </section>
      )}

      {visibleSubmissions.length > 0 && (
        <section className="px-4 pb-3">
          <StatsPanel
            total={visibleSubmissions.length}
            pending={pending.length}
            reviewed={reviewedCount}
          />
        </section>
      )}

      <section className="px-2 pt-3 pb-4 border-t border-border/60">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-1.5 px-2 mt-1">
          Checkpoint
          {isFiltered && (
            <span className="normal-case tracking-normal text-muted-foreground/55 ml-1">
              ({visibleSubmissions.length} shown)
            </span>
          )}
        </p>
        <div className="space-y-0.5">
          <SubmissionGroup
            label="Needs review"
            count={pending.length}
            defaultOpen
            items={pending}
            onSelect={onOpenSubmission}
          />
          <SubmissionGroup
            label="Reviewed"
            count={reviewed.length}
            items={reviewed}
            onSelect={onOpenSubmission}
          />
          <SubmissionGroup
            label="Merged"
            count={merged.length}
            items={merged}
            onSelect={onOpenSubmission}
          />
        </div>
      </section>
    </div>
  );
}

function SubmissionGroup({
  label,
  count,
  items,
  defaultOpen = false,
  onSelect,
}: {
  label: string;
  count: number;
  items: SubmissionSummary[];
  defaultOpen?: boolean;
  onSelect: (id: string) => void;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md hover:bg-black/5 transition-colors text-left"
      >
        <ChevronRight
          className={`w-3 h-3 text-muted-foreground/80 transition-transform ${
            open ? 'rotate-90' : ''
          }`}
        />
        <span className="text-xs font-medium text-foreground/85 flex-1 truncate">
          {label}
        </span>
        <span className="text-[10px] text-muted-foreground/70 tabular-nums">
          {count}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pl-6 pr-2 pb-1 pt-0.5">
              {items.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/55 px-2 py-1">
                  Nothing here.
                </p>
              ) : (
                items.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => onSelect(s.id)}
                    className="w-full text-left px-2 py-0.5 rounded-md hover:bg-black/5 transition-colors"
                  >
                    <span className="block text-[11px] text-foreground/85 truncate leading-tight">
                      {s.title}
                    </span>
                    <span className="block text-[9px] text-muted-foreground/65 mt-0.5 truncate">
                      {shortId(s.id)} · {s.fileCount}{' '}
                      {s.fileCount === 1 ? 'file' : 'files'} ·{' '}
                      {formatSubmittedDate(s.createdAt)}
                    </span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
