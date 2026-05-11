import type { FileVersion } from '@/api/submissions';
import { useFileText } from './useFileText';
import { PreviewError, PreviewLoading } from './PreviewShell';

export function TextPreview({
  submissionId,
  fileId,
  version,
}: {
  submissionId: string;
  fileId: string;
  version: FileVersion;
}) {
  const { text, loading, error } = useFileText(submissionId, fileId, version);
  if (loading) return <PreviewLoading />;
  if (error) return <PreviewError message={error} />;

  return (
    <pre className="text-[11px] font-mono leading-relaxed bg-white border border-border rounded-md p-3 overflow-x-auto whitespace-pre-wrap break-words max-h-[480px] overflow-y-auto">
      {text}
    </pre>
  );
}
