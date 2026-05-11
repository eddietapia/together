import { Share } from 'lucide-react';
import { useState } from 'react';

function checkpointShareUrl(submissionId: string): string {
  const url = new URL(window.location.href);
  url.searchParams.set('checkpoint', submissionId);
  return url.toString();
}

export function ShareCheckpointButton({ submissionId }: { submissionId: string }) {
  const [copied, setCopied] = useState(false);

  async function shareCheckpoint(event: React.MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    const url = checkpointShareUrl(submissionId);
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      type="button"
      onClick={shareCheckpoint}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white border border-border text-foreground rounded-md hover:bg-black/5 transition-colors"
      aria-label={`Share ${submissionId}`}
    >
      <Share className="w-3.5 h-3.5" />
      {copied ? 'Copied' : 'Share'}
    </button>
  );
}
