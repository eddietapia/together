import { useMemo } from 'react';
import { Search } from 'lucide-react';
import type { SubmissionSummary } from '@/types/submission';
import { matchesSubmissionFilter } from '@/lib/utils';
import { VirusBoard } from './VirusBoard';
import { EmptyState } from './EmptyState';
import logoIcon from '@/assets/Biomni Lab Logo Icon.png';
import {
  CATEGORY_VISUALS,
  getSubmissionCategory,
  type SubmissionCategory,
} from './submissionVisuals';

const CATEGORIES: SubmissionCategory[] = [
  'high-impact',
  'conflicting',
  'low-risk',
];

export function Home({
  submissions,
  loading,
  error,
  searchFilter,
  onSearchFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  onOpenSubmission,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  searchFilter: string;
  onSearchFilterChange: (s: string) => void;
  categoryFilter: SubmissionCategory | null;
  onCategoryFilterChange: (category: SubmissionCategory | null) => void;
  onOpenSubmission: (id: string) => void;
}) {
  const spikes = useMemo(
    () => submissions.filter(s => s.status === 'pending'),
    [submissions]
  );

  const initialOrder = useMemo(() => spikes.map(x => x.id), [spikes]);

  function handleReview(id: string) {
    onOpenSubmission(id);
  }

  const initialCount = initialOrder.length;

  const matchedSpikes = useMemo(
    () => spikes.filter(s => matchesSubmissionFilter(s, searchFilter)),
    [spikes, searchFilter]
  );

  const categoryCounts = useMemo(
    () =>
      matchedSpikes.reduce<Record<SubmissionCategory, number>>(
        (counts, spike) => {
          counts[getSubmissionCategory(spike)] += 1;
          return counts;
        },
        { 'high-impact': 0, conflicting: 0, 'low-risk': 0 }
      ),
    [matchedSpikes]
  );

  const visibleCount = useMemo(
    () =>
      matchedSpikes.filter(
        s => !categoryFilter || getSubmissionCategory(s) === categoryFilter
      ).length,
    [matchedSpikes, categoryFilter]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-xs text-muted-foreground animate-pulse">
          Resolving structure…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="px-4 py-3 rounded-md bg-red-50 border border-red-200 max-w-sm">
          <p className="text-xs text-red-800 font-medium">
            Failed to load submissions.
          </p>
          <p className="text-[11px] text-red-700/80 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  if (initialCount === 0) {
    return (
      <div className="relative h-full w-full flex flex-col">
        <div className="flex-1 relative">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <div className="flex-1 relative">
        <RiskFilterBar
          counts={categoryCounts}
          active={categoryFilter}
          onChange={onCategoryFilterChange}
        />
        <VirusBoard
          spikes={spikes}
          initialOrder={initialOrder}
          initialCount={initialCount}
          loading={loading}
          categoryFilter={categoryFilter}
          searchFilter={searchFilter}
          onReview={handleReview}
        />
        <BottomCommandCard
          searchFilter={searchFilter}
          onSearchFilterChange={onSearchFilterChange}
          visibleCount={visibleCount}
        />
      </div>
    </div>
  );
}

function RiskFilterBar({
  counts,
  active,
  onChange,
}: {
  counts: Record<SubmissionCategory, number>;
  active: SubmissionCategory | null;
  onChange: (category: SubmissionCategory | null) => void;
}) {
  return (
    <div className="absolute left-1/2 top-5 z-20 -translate-x-1/2">
      <div className="rounded-2xl border border-black/5 bg-[#fffdf7]/85 px-5 py-3 shadow-[0_12px_34px_hsla(25,25%,35%,0.08)] backdrop-blur-md">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((category, i) => {
            const visual = CATEGORY_VISUALS[category];
            const isActive = active === category;
            return (
              <div key={category} className="flex items-center gap-2">
                {i > 0 && <div className="h-7 w-px bg-black/8 mx-1" />}
                <button
                  type="button"
                  onClick={() => onChange(isActive ? null : category)}
                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-black/6 ring-1 ring-black/10'
                      : 'hover:bg-black/4'
                  }`}
                >
                  <span
                    className="h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform"
                    style={{
                      background: visual.soft,
                      transform: isActive ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: visual.accent }}
                    />
                  </span>
                  <span className="text-left">
                    <span className="block text-xs font-semibold text-foreground">
                      {visual.label}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {counts[category]} · {visual.description}
                    </span>
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BottomCommandCard({
  searchFilter,
  onSearchFilterChange,
  visibleCount,
}: {
  searchFilter: string;
  onSearchFilterChange: (s: string) => void;
  visibleCount: number;
}) {
  return (
    <div className="absolute left-1/2 bottom-7 z-20 w-[min(700px,calc(100%-4rem))] -translate-x-1/2">
      <div className="mb-5 flex items-start justify-center gap-4">
        <img
          src={logoIcon}
          alt=""
          className="mt-1 h-11 w-11 flex-shrink-0 object-contain"
          draggable={false}
        />
        <div className="min-w-0 text-center">
          <h1 className="font-serif text-[40px] font-semibold leading-none tracking-[-0.04em] text-foreground">
            Hi Eddie
          </h1>
        </div>
      </div>

      <div className="rounded-2xl border border-black/10 bg-[#fffdf7]/90 shadow-[0_18px_45px_hsla(25,25%,35%,0.12)] backdrop-blur-md overflow-hidden">
        <div className="border-b border-black/10 px-4 py-2.5 text-[11px] font-medium text-muted-foreground">
          Merging changes makes the virus weaker! Review each checkpoint to take
          down this virus!
        </div>
        <label className="flex items-center gap-2 px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={searchFilter}
            onChange={e => onSearchFilterChange(e.target.value)}
            placeholder="Search submissions…"
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <span className="text-[10px] text-muted-foreground/70 whitespace-nowrap">
            {visibleCount} match{visibleCount === 1 ? '' : 'es'}
          </span>
        </label>
      </div>
    </div>
  );
}
