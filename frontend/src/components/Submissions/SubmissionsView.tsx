import type { SubmissionSummary } from '@/types/submission';
import { SubmissionsList } from './SubmissionsList';
import { SubmissionDetail } from './SubmissionDetail';
import type { SubmissionCategory } from '@/components/Home/submissionVisuals';

export function SubmissionsView({
  submissions,
  loading,
  error,
  filter,
  categoryFilter,
  selectedId,
  onSelect,
  onRefresh,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  filter: string;
  categoryFilter: SubmissionCategory | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onRefresh: () => void;
}) {
  if (selectedId) {
    return (
      <SubmissionDetail
        submissionId={selectedId}
        onBack={() => onSelect(null)}
        onRefresh={onRefresh}
      />
    );
  }
  return (
    <SubmissionsList
      submissions={submissions}
      loading={loading}
      error={error}
      filter={filter}
      categoryFilter={categoryFilter}
      onOpen={onSelect}
    />
  );
}
