import type { FileVersion } from '@/api/submissions';
import { useFileText } from './useFileText';
import { PreviewError, PreviewLoading } from './PreviewShell';

export function JSONPreview({
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
  if (text == null) return null;

  let pretty = text;
  try {
    pretty = JSON.stringify(JSON.parse(text), null, 2);
  } catch {
    // fall back to raw text
  }

  return (
    <pre className="text-[11px] font-mono leading-relaxed bg-white border border-border rounded-md p-3 overflow-x-auto whitespace-pre max-h-[480px] overflow-y-auto">
      {pretty}
    </pre>
  );
}
