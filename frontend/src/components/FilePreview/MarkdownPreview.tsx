import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { FileVersion } from '@/api/submissions';
import { useFileText } from './useFileText';
import { PreviewError, PreviewLoading } from './PreviewShell';

export function MarkdownPreview({
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

  return (
    <div className="bg-white border border-border rounded-md p-4 max-h-[480px] overflow-y-auto text-sm leading-relaxed text-foreground markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
    </div>
  );
}
