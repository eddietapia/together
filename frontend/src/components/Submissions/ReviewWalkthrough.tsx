import { CheckCircle2, GitBranch, Route } from 'lucide-react';
import type { SubmissionFile } from '@/types/submission';
import type {
  FileReviewInsight,
  ReviewRisk,
  SubmissionWalkthrough,
  WalkthroughStep,
} from '@/lib/reviewWalkthrough';
import { REVIEW_PILL } from '@/constants/statusStyles';
import { FileRow } from './FileRow';

const RISK_STYLE: Record<ReviewRisk, string> = {
  low: 'bg-green-100 text-green-700',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-700',
};

function riskLabel(risk: ReviewRisk): string {
  if (risk === 'high') return 'High attention';
  if (risk === 'medium') return 'Medium attention';
  return 'Low attention';
}

function StepCard({
  step,
  index,
  files,
  active,
  expandedFileId,
  onSelect,
  onToggleFile,
  onUpdated,
  fileInsights,
}: {
  step: WalkthroughStep;
  index: number;
  files: SubmissionFile[];
  active: boolean;
  expandedFileId: string | null;
  onSelect: () => void;
  onToggleFile: (fileId: string) => void;
  onUpdated: (file: SubmissionFile) => void;
  fileInsights: Record<string, FileReviewInsight>;
}) {
  const reviewed = files.filter(file => file.status !== 'pending').length;

  return (
    <div
      className={`w-full text-left bg-card border rounded-xl px-4 py-3 transition-all ${
        active
          ? 'border-foreground/20 shadow-sm'
          : 'border-border hover:border-foreground/15 hover:shadow-sm'
      }`}
    >
      <button type="button" onClick={onSelect} className="w-full text-left flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-semibold ${
            active ? 'bg-foreground text-background' : 'bg-black/5 text-muted-foreground'
          }`}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
              {step.kicker}
            </span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${RISK_STYLE[step.risk]}`}
            >
              {riskLabel(step.risk)}
            </span>
          </div>
          <h3 className="text-sm font-semibold text-foreground leading-snug">
            {step.title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {step.summary}
          </p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {files.map(file => (
              <span
                key={file.id}
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${REVIEW_PILL[file.status]}`}
              >
                {file.filename}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/70 mt-2">
            {reviewed}/{files.length} reviewed
          </p>
        </div>
      </button>

      {active && (
        <div className="mt-3 space-y-3 border-t border-border/60 pt-3">
          <div className="rounded-md border border-border bg-white px-3 py-2">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
              Reviewer focus
            </p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">
              {step.reviewerFocus}
            </p>
          </div>
          <div className="space-y-1.5">
            {files.map(file => (
              <FileRow
                key={file.id}
                file={file}
                expanded={expandedFileId === file.id}
                onToggle={() => onToggleFile(file.id)}
                onUpdated={onUpdated}
                insight={fileInsights[file.id]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ReviewWalkthrough({
  walkthrough,
  files,
  activeStepId,
  expandedFileId,
  onSelectStep,
  onToggleFile,
  onUpdatedFile,
}: {
  walkthrough: SubmissionWalkthrough;
  files: SubmissionFile[];
  activeStepId: string | null;
  expandedFileId: string | null;
  onSelectStep: (step: WalkthroughStep) => void;
  onToggleFile: (fileId: string) => void;
  onUpdatedFile: (file: SubmissionFile) => void;
}) {
  const fileById = new Map(files.map(file => [file.id, file]));
  const activeStep =
    walkthrough.steps.find(step => step.id === activeStepId) ?? walkthrough.steps[0];

  return (
    <section className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0 max-w-2xl">
            <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium mb-2">
              <Route className="w-3.5 h-3.5" />
              Guided verification walkthrough
            </div>
            <h2 className="text-base font-semibold text-foreground leading-snug">
              {walkthrough.headline}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              {walkthrough.reviewerPromise}
            </p>
          </div>
          <div className="bg-white border border-border rounded-lg px-3 py-2 md:w-72">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
              Review question
            </p>
            <p className="text-xs text-foreground mt-1 leading-relaxed">
              {walkthrough.primaryQuestion}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)]">
        <div className="p-4 border-b border-border lg:border-b-0 lg:border-r">
          <div className="space-y-2">
            {walkthrough.steps.map((step, index) => {
              const stepFiles = step.fileIds
                .map(fileId => fileById.get(fileId))
                .filter((file): file is SubmissionFile => Boolean(file));
              return (
                <StepCard
                  key={step.id}
                  step={step}
                  index={index}
                  files={stepFiles}
                  active={activeStep.id === step.id}
                  expandedFileId={expandedFileId}
                  onSelect={() => onSelectStep(step)}
                  onToggleFile={onToggleFile}
                  onUpdated={onUpdatedFile}
                  fileInsights={walkthrough.fileInsights}
                />
              );
            })}
          </div>
        </div>

        <aside className="bg-[#f5f2eb]/70 p-4 space-y-3">
          <div className="bg-white border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                Verification checklist
              </p>
            </div>
            <div className="space-y-2">
              {walkthrough.checklist.map(item => (
                <label key={item} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <input type="checkbox" className="mt-0.5 h-3.5 w-3.5 rounded border-border" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border border-border rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                Split suggestion
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {walkthrough.splitSuggestion}
            </p>
            <button
              type="button"
              className="mt-3 px-3 py-1.5 text-xs font-medium bg-white border border-border text-foreground rounded-md hover:bg-black/5 transition-colors"
            >
              Fork into smaller reviews
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
