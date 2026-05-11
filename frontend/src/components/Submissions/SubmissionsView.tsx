import type { SubmissionSummary } from '@/types/submission';
import { SubmissionsList } from './SubmissionsList';
import { SubmissionDetail } from './SubmissionDetail';

export function SubmissionsView({
  submissions,
  loading,
  error,
  filter,
  selectedId,
  onSelect,
}: {
  submissions: SubmissionSummary[];
  loading: boolean;
  error: string | null;
  filter: string;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  if (selectedId) {
    return (
      <SubmissionDetail
        submissionId={selectedId}
        onBack={() => onSelect(null)}
      />
    );
  }
  return (
    <SubmissionsList
      submissions={submissions}
      loading={loading}
      error={error}
      filter={filter}
      onOpen={onSelect}
    />
  );
}
