import { submissionFileContentUrl, type FileVersion } from '@/api/submissions';

export function ImagePreview({
  submissionId,
  fileId,
  version,
  alt,
}: {
  submissionId: string;
  fileId: string;
  version: FileVersion;
  alt: string;
}) {
  return (
    <div className="flex items-center justify-center bg-[#fffdf7] border border-border rounded-md p-2">
      <img
        src={submissionFileContentUrl(submissionId, fileId, version)}
        alt={alt}
        className="max-h-[480px] w-auto object-contain"
        draggable={false}
      />
    </div>
  );
}
