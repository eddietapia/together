import type { FileVersion } from '@/api/submissions';
import type { SubmissionFile } from '@/types/submission';
import { fileKindFor } from './fileType';
import { ImagePreview } from './ImagePreview';
import { CSVPreview } from './CSVPreview';
import { JSONPreview } from './JSONPreview';
import { MarkdownPreview } from './MarkdownPreview';
import { TextPreview } from './TextPreview';
import { PDFPreview } from './PDFPreview';
import { PreviewMissing } from './PreviewShell';

export function FilePreview({
  file,
  version,
}: {
  file: SubmissionFile;
  version: FileVersion;
}) {
  const kind = fileKindFor(file);
  const common = {
    submissionId: file.submissionId,
    fileId: file.id,
    version,
  };

  switch (kind) {
    case 'image':
      return <ImagePreview {...common} alt={file.filename} />;
    case 'pdf':
      return <PDFPreview {...common} />;
    case 'csv':
      return <CSVPreview {...common} />;
    case 'json':
      return <JSONPreview {...common} />;
    case 'markdown':
      return <MarkdownPreview {...common} />;
    case 'text':
      return <TextPreview {...common} />;
    case 'binary':
    default:
      return (
        <PreviewMissing
          label={`No inline preview for ${file.mimeType ?? 'this file type'}`}
        />
      );
  }
}
