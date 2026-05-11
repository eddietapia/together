import { useState } from 'react';
import type { SubmissionFile } from '@/types/submission';
import { fileKindFor, isDiffableKind } from './fileType';
import { FilePreview } from './FilePreview';
import { useFileText } from './useFileText';
import { PreviewError, PreviewLoading } from './PreviewShell';
import { UnifiedDiff } from './UnifiedDiff';

type DiffMode = 'side-by-side' | 'unified';

export function FileDiff({ file }: { file: SubmissionFile }) {
  const kind = fileKindFor(file);
  const [mode, setMode] = useState<DiffMode>('side-by-side');
  const diffable = isDiffableKind(kind);

  return (
    <div className="space-y-2">
      {diffable && (
        <div className="flex items-center gap-1">
          <DiffModeButton
            label="Side-by-side"
            active={mode === 'side-by-side'}
            onClick={() => setMode('side-by-side')}
          />
          <DiffModeButton
            label="Unified diff"
            active={mode === 'unified'}
            onClick={() => setMode('unified')}
          />
        </div>
      )}

      {mode === 'unified' && diffable ? (
        <UnifiedDiffPane file={file} />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <DiffPane label="Current">
            <FilePreview file={file} version="current" />
          </DiffPane>
          <DiffPane label="Proposed">
            <FilePreview file={file} version="proposed" />
          </DiffPane>
        </div>
      )}
    </div>
  );
}

function DiffPane({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium px-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function DiffModeButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
        active
          ? 'bg-foreground text-background'
          : 'bg-black/5 text-muted-foreground hover:bg-black/10'
      }`}
    >
      {label}
    </button>
  );
}

function UnifiedDiffPane({ file }: { file: SubmissionFile }) {
  const current = useFileText(file.submissionId, file.id, 'current');
  const proposed = useFileText(file.submissionId, file.id, 'proposed');

  if (current.loading || proposed.loading) return <PreviewLoading />;
  if (current.error)
    return <PreviewError message={`Current: ${current.error}`} />;
  if (proposed.error)
    return <PreviewError message={`Proposed: ${proposed.error}`} />;
  if (current.text == null || proposed.text == null) return null;

  return <UnifiedDiff currentText={current.text} proposedText={proposed.text} />;
}
