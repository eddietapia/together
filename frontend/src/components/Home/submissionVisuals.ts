import type { SubmissionSummary } from "@/types/submission";

export type SubmissionCategory = "high-impact" | "conflicting" | "low-risk";

export const CATEGORY_VISUALS: Record<
  SubmissionCategory,
  {
    label: string;
    description: string;
    hue: number;
    accent: string;
    soft: string;
    text: string;
  }
> = {
  "high-impact": {
    label: "High impact",
    description: "Requires attention",
    hue: 4,
    accent: "hsla(4, 78%, 58%, 1)",
    soft: "hsla(4, 86%, 95%, 0.9)",
    text: "text-red-700",
  },
  conflicting: {
    label: "Conflicting",
    description: "Needs resolution",
    hue: 34,
    accent: "hsla(34, 86%, 53%, 1)",
    soft: "hsla(36, 92%, 94%, 0.92)",
    text: "text-amber-700",
  },
  "low-risk": {
    label: "Low risk",
    description: "Minor updates",
    hue: 98,
    accent: "hsla(98, 42%, 50%, 1)",
    soft: "hsla(98, 56%, 94%, 0.9)",
    text: "text-lime-700",
  },
};

export function getSubmissionCategory(
  submission: SubmissionSummary,
): SubmissionCategory {
  const { created, updated, deleted } = submission.fileActions;

  // Destructive changes or very large submissions need careful review.
  if (deleted > 0 || submission.fileCount >= 8) {
    return "high-impact";
  }

  // Mixed creates + updates indicate refactoring / overlap with existing files.
  if (created > 0 && updated > 0) {
    return "conflicting";
  }

  // Multiple updates without creates = potentially overlapping changes.
  if (updated >= 2) {
    return "conflicting";
  }

  return "low-risk";
}

export function getConfidenceScore(submission: SubmissionSummary): number {
  const category = getSubmissionCategory(submission);
  const seed = submission.id
    .split("")
    .reduce((total, char) => total + char.charCodeAt(0), 0);

  if (category === "high-impact") return 78 + (seed % 14);
  if (category === "conflicting") return 64 + (seed % 18);
  return 86 + (seed % 10);
}
