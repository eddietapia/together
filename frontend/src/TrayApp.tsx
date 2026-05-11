import { useEffect, useState } from 'react';
import { fetchSubmissions } from '@/api/submissions';
import type { SubmissionSummary } from '@/types/submission';
import { formatRelativeTime } from '@/lib/utils';
import logoIcon from '@/assets/Biomni Lab Logo Icon.png';

export function TrayApp() {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions()
      .then(all => setSubmissions(all.filter(s => s.status === 'pending')))
      .finally(() => setLoading(false));
  }, []);

  async function handleApproveAll(id: string) {
    setApprovingId(id);
    try {
      await fetch(`/api/submissions/${id}/approve-all`, { method: 'PATCH' });
      setSubmissions(prev => prev.filter(s => s.id !== id));
    } finally {
      setApprovingId(null);
    }
  }

  return (
    <div className="flex flex-col h-screen text-white overflow-hidden rounded-xl bg-[#1a1a1c]/85 select-none">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0">
        <img
          src={logoIcon}
          alt=""
          className="h-4 w-4 object-contain opacity-75 flex-shrink-0"
          draggable={false}
        />
        <span className="text-[12px] font-semibold text-white/80 flex-1 tracking-tight">
          Pending Checkpoints
        </span>
        {!loading && (
          <span className="text-[10px] bg-white/10 text-white/50 rounded-full px-1.5 py-px tabular-nums">
            {submissions.length}
          </span>
        )}
      </div>

      {/* Submission list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-center text-[11px] text-white/35 py-8 animate-pulse">
            Loading…
          </p>
        ) : submissions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-1 pb-8">
            <p className="text-[12px] text-white/45 font-medium">All clear</p>
          <p className="text-[10px] text-white/25">No pending checkpoints</p>
          </div>
        ) : (
          submissions.map((s, i) => (
            <SubmissionRow
              key={s.id}
              submission={s}
              separator={i > 0}
              approving={approvingId === s.id}
              onReview={() => window.electronAPI?.reviewSubmission(s.id)}
              onApproveAll={() => handleApproveAll(s.id)}
              onShare={() => window.electronAPI?.shareSubmission(s.title)}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 px-3 py-2 flex items-center justify-between flex-shrink-0">
        <button
          type="button"
          onClick={() => window.electronAPI?.openApp()}
          className="text-[10px] text-white/35 hover:text-white/65 transition-colors"
        >
          Open Checkpoints
        </button>
        <button
          type="button"
          onClick={() => window.electronAPI?.closeTray()}
          className="text-[10px] text-white/35 hover:text-white/65 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function SubmissionRow({
  submission,
  separator,
  approving,
  onReview,
  onApproveAll,
  onShare,
}: {
  submission: SubmissionSummary;
  separator: boolean;
  approving: boolean;
  onReview: () => void;
  onApproveAll: () => void;
  onShare: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`px-3 py-2 cursor-default ${separator ? 'border-t border-white/6' : ''}`}
      style={{ background: hovered ? 'rgba(255,255,255,0.05)' : 'transparent' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <p className="text-[12px] font-medium text-white/85 truncate leading-snug">
        {submission.title}
      </p>
      <p className="text-[10px] text-white/38 mt-0.5">
        {submission.fileCount} {submission.fileCount === 1 ? 'file' : 'files'}
        {' · '}
        {formatRelativeTime(new Date(submission.createdAt))}
      </p>
      {hovered && (
        <div className="flex items-center gap-1 mt-1.5">
          <TrayAction label="Review" onClick={onReview} primary />
          <TrayAction
            label={approving ? 'Approving…' : 'Approve'}
            onClick={onApproveAll}
            disabled={approving}
          />
          <TrayAction label="Share" onClick={onShare} />
        </div>
      )}
    </div>
  );
}

function TrayAction({
  label,
  onClick,
  primary = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`px-2.5 py-0.5 rounded text-[10px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        primary
          ? 'bg-white/16 text-white/85 hover:bg-white/24'
          : 'bg-white/8 text-white/55 hover:bg-white/14'
      }`}
    >
      {label}
    </button>
  );
}
