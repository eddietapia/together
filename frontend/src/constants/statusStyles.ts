import type { ReviewStatus, SubmissionStatus } from '@/types/submission';

export const STATUS_PILL: Record<SubmissionStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  merged: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
};

export const REVIEW_PILL: Record<ReviewStatus, string> = {
  pending: 'bg-stone-100 text-stone-600',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};
