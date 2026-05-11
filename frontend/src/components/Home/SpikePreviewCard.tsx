import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { SubmissionSummary } from "@/types/submission";
import { formatSubmittedDate } from "@/lib/utils";
import {
  CATEGORY_VISUALS,
  getConfidenceScore,
  getSubmissionCategory,
} from "./submissionVisuals";

export function SpikePreviewCard({
  submission,
  onReview,
  onClose,
}: {
  submission: SubmissionSummary | null;
  onReview: (id: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute top-6 right-6 z-20 pointer-events-none"
      data-spike-pinned="true"
    >
      <AnimatePresence mode="wait">
        {submission && (
          <motion.div
            key={submission.id}
            initial={{ opacity: 0, y: -6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="pointer-events-auto"
          >
            <CardBody
              submission={submission}
              onReview={onReview}
              onClose={onClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CardBody({
  submission,
  onReview,
  onClose,
}: {
  submission: SubmissionSummary;
  onReview: (id: string) => void;
  onClose: () => void;
}) {
  const category = getSubmissionCategory(submission);
  const visual = CATEGORY_VISUALS[category];
  const confidence = getConfidenceScore(submission);
  const submittedAt = formatSubmittedDate(submission.createdAt);
  const actionSummary = [
    submission.fileActions.created > 0 &&
      `${submission.fileActions.created} created`,
    submission.fileActions.updated > 0 &&
      `${submission.fileActions.updated} updated`,
    submission.fileActions.deleted > 0 &&
      `${submission.fileActions.deleted} deleted`,
  ].filter(Boolean);

  return (
    <div
      className="w-80 rounded-2xl p-3 text-[11px]"
      style={{
        color: "hsla(20, 30%, 22%, 0.92)",
        background: "hsla(45, 36%, 97%, 0.92)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        border: "1px solid hsla(28, 22%, 78%, 0.5)",
        boxShadow:
          "0 1px 2px hsla(20, 25%, 30%, 0.05), 0 14px 36px hsla(20, 25%, 30%, 0.12)",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold text-foreground leading-snug">
            {submission.title}
          </p>
          {submission.description && (
            <p className="mt-1 text-muted-foreground line-clamp-2 leading-snug">
              {submission.description}
            </p>
          )}
        </div>
        <div className="flex items-start gap-1.5 flex-shrink-0">
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{ color: visual.accent, background: visual.soft }}
          >
            {visual.label}
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="w-5 h-5 -mr-1 -mt-0.5 flex items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground hover:bg-black/5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-muted-foreground">
        <span>Status</span>
        <span className="font-medium text-foreground capitalize">
          {submission.status}
        </span>
        <span>Confidence</span>
        <span className="font-medium text-foreground">{confidence}%</span>
        <span>Submitted</span>
        <span className="font-medium text-foreground">{submittedAt}</span>
        <span>Files</span>
        <span className="font-medium text-foreground">
          {submission.fileCount}
          {actionSummary.length > 0 ? ` · ${actionSummary.join(", ")}` : ""}
        </span>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div
          className="h-full rounded-full"
          style={{
            width: `${confidence}%`,
            background: visual.accent,
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => onReview(submission.id)}
        className="mt-3 inline-flex items-center gap-1 rounded-full bg-transparent p-0 text-[11px] font-semibold"
        style={{ color: visual.accent }}
      >
        Review
        <span aria-hidden>→</span>
      </button>
    </div>
  );
}
