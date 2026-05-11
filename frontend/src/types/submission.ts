export type FileAction = 'created' | 'updated' | 'deleted';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';
export type SubmissionStatus = 'pending' | 'merged' | 'rejected';

export interface SubmissionSummary {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  createdAt: number;
  status: SubmissionStatus;
  fileCount: number;
  reviewProgress: {
    pending: number;
    approved: number;
    rejected: number;
  };
  fileActions: {
    created: number;
    updated: number;
    deleted: number;
  };
}

export interface Submission {
  id: string;
  title: string;
  description: string | null;
  author: string | null;
  createdAt: number;
  status: SubmissionStatus;
}

export interface SubmissionFile {
  id: string;
  submissionId: string;
  filename: string;
  path: string | null;
  targetPath: string;
  mimeType: string | null;
  size: number | null;
  action: FileAction;
  message: string | null;
  status: ReviewStatus;
  reviewComment: string | null;
}

export interface SubmissionDetail {
  submission: Submission;
  files: SubmissionFile[];
}
