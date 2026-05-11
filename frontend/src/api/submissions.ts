import type {
  ReviewStatus,
  SubmissionDetail,
  SubmissionFile,
  SubmissionSummary,
} from '@/types/submission';

export async function fetchSubmissions(): Promise<SubmissionSummary[]> {
  const res = await fetch('/api/submissions');
  if (!res.ok) throw new Error(`checkpoint list failed: ${res.status}`);
  const data = (await res.json()) as { submissions: SubmissionSummary[] };
  return data.submissions;
}

export async function fetchSubmission(id: string): Promise<SubmissionDetail> {
  const res = await fetch(`/api/submissions/${encodeURIComponent(id)}`);
  if (res.status === 404) throw new Error('Checkpoint not found');
  if (!res.ok) throw new Error(`checkpoint detail failed: ${res.status}`);
  return (await res.json()) as SubmissionDetail;
}

export type FileVersion = 'proposed' | 'current';

export function submissionFileContentUrl(
  submissionId: string,
  fileId: string,
  version: FileVersion
): string {
  return `/api/submissions/${encodeURIComponent(
    submissionId
  )}/files/${encodeURIComponent(fileId)}/content?version=${version}`;
}

export async function fetchSubmissionFileText(
  submissionId: string,
  fileId: string,
  version: FileVersion
): Promise<string> {
  const res = await fetch(submissionFileContentUrl(submissionId, fileId, version));
  if (res.status === 404) throw new Error('File not found on disk');
  if (res.status === 410) throw new Error('No proposed bytes for deleted file');
  if (!res.ok) throw new Error(`file content failed: ${res.status}`);
  return res.text();
}

export async function updateSubmissionFileStatus(
  submissionId: string,
  fileId: string,
  status: ReviewStatus,
  comment?: string
): Promise<SubmissionFile> {
  const res = await fetch(
    `/api/submissions/${encodeURIComponent(
      submissionId
    )}/files/${encodeURIComponent(fileId)}/status`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, comment }),
    }
  );
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(data.error ?? `status update failed: ${res.status}`);
  }
  const data = (await res.json()) as { file: SubmissionFile };
  return data.file;
}
