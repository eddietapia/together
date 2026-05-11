import { submissionFileContentUrl, type FileVersion } from '@/api/submissions';

export function PDFPreview({
  submissionId,
  fileId,
  version,
}: {
  submissionId: string;
  fileId: string;
  version: FileVersion;
}) {
  const url = submissionFileContentUrl(submissionId, fileId, version);
  return (
    <div className="bg-[#fffdf7] border border-border rounded-md overflow-hidden">
      <embed
        src={url}
        type="application/pdf"
        className="w-full"
        style={{ height: 640 }}
      />
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="block text-[11px] text-muted-foreground hover:text-foreground px-3 py-1.5 border-t border-border"
      >
        Open in new tab
      </a>
    </div>
  );
}
