import { useEffect, useState } from 'react';
import { fetchSubmissions } from '@/api/submissions';
import type { SubmissionSummary } from '@/types/submission';
import { VirusBoard } from './VirusBoard';
import { WelcomeHeader } from './WelcomeHeader';
import { EmptyState } from './EmptyState';

export function Home({
  onOpenSubmission,
}: {
  onOpenSubmission: (id: string) => void;
}) {
  const [spikes, setSpikes] = useState<SubmissionSummary[]>([]);
  const [initialOrder, setInitialOrder] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  function handleReview(id: string) {
    onOpenSubmission(id);
  }

  useEffect(() => {
    let cancelled = false;
    fetchSubmissions()
      .then(s => {
        if (cancelled) return;
        // Spikes represent pending submissions only. Once a submission is
        // merged or rejected it drops from this list naturally on next fetch
        // (next mount of Home). Clicks navigate but DO NOT remove from state.
        const pending = s.filter(x => x.status === 'pending');
        setSpikes(pending);
        setInitialOrder(pending.map(x => x.id));
        setError(null);
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
  }, []);

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

  const initialCount = initialOrder.length;

  if (initialCount === 0) {
    return (
      <div className="relative h-full w-full flex flex-col">
        <WelcomeHeader />
        <div className="flex-1 relative">
          <EmptyState />
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full flex flex-col">
      <WelcomeHeader />
      <div className="flex-1 relative">
        <VirusBoard
          spikes={spikes}
          initialOrder={initialOrder}
          initialCount={initialCount}
          loading={loading}
          onReview={handleReview}
        />
      </div>
    </div>
  );
}
