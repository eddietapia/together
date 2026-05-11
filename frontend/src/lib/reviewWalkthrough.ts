import type { SubmissionDetail, SubmissionFile } from '@/types/submission';

export type ReviewRisk = 'low' | 'medium' | 'high';

export interface FileReviewInsight {
  role: string;
  reviewerFocus: string;
  value: string;
  evidence: string[];
}

export interface WalkthroughStep {
  id: string;
  kicker: string;
  risk: ReviewRisk;
  title: string;
  summary: string;
  fileIds: string[];
  reviewerFocus: string;
}

export interface SubmissionWalkthrough {
  headline: string;
  reviewerPromise: string;
  primaryQuestion: string;
  steps: WalkthroughStep[];
  checklist: string[];
  splitSuggestion: string;
  fileInsights: Record<string, FileReviewInsight>;
}

function fileCategory(file: SubmissionFile): 'script' | 'data' | 'config' | 'docs' | 'other' {
  const ext = file.filename.split('.').pop()?.toLowerCase() ?? '';
  if (['py', 'ipynb', 'r', 'rmd'].includes(ext)) return 'script';
  if (['csv', 'tsv', 'json', 'parquet', 'xlsx'].includes(ext)) return 'data';
  if (['yaml', 'yml', 'toml', 'ini', 'cfg', 'conf'].includes(ext)) return 'config';
  if (['md', 'txt', 'rst'].includes(ext)) return 'docs';
  return 'other';
}

function deriveInsight(file: SubmissionFile): FileReviewInsight {
  const cat = fileCategory(file);

  if (cat === 'script') {
    return {
      role: 'Analysis script',
      reviewerFocus: 'Verify the logic changes match the stated intent and do not introduce regressions.',
      value:
        file.action === 'updated'
          ? 'Core logic was modified — review the diff carefully.'
          : 'New analysis code introduced.',
      evidence: file.message
        ? [file.message]
        : ['Check method signatures, data transformations, and output assumptions.'],
    };
  }
  if (cat === 'data') {
    return {
      role: 'Data file',
      reviewerFocus: 'Confirm expected row/column counts and that no unexpected samples were dropped.',
      value: 'Raw or processed dataset used in the analysis.',
      evidence: file.message
        ? [file.message]
        : ['Verify schema consistency and sample completeness.'],
    };
  }
  if (cat === 'config') {
    return {
      role: 'Configuration',
      reviewerFocus: 'Check that parameter values are within acceptable ranges and match the experiment design.',
      value: 'Runtime parameters that affect analysis behavior.',
      evidence: file.message
        ? [file.message]
        : ['Look for threshold changes, flag toggles, or path updates.'],
    };
  }
  if (cat === 'docs') {
    return {
      role: 'Documentation',
      reviewerFocus: 'Confirm that the narrative accurately reflects what the code does.',
      value: 'Human-readable explanation of the analysis.',
      evidence: file.message ? [file.message] : ['Check for consistency with code changes.'],
    };
  }
  return {
    role: 'Supporting file',
    reviewerFocus: 'Review the change in context of the overall submission.',
    value:
      file.action === 'deleted'
        ? 'File removed — confirm it is no longer needed.'
        : 'Supporting artifact.',
    evidence: file.message ? [file.message] : [],
  };
}

function categoryKicker(cat: ReturnType<typeof fileCategory>): string {
  if (cat === 'script') return 'Analysis code';
  if (cat === 'data') return 'Dataset';
  if (cat === 'config') return 'Configuration';
  if (cat === 'docs') return 'Documentation';
  return 'Supporting files';
}

function categoryRisk(cat: ReturnType<typeof fileCategory>): ReviewRisk {
  if (cat === 'script') return 'high';
  if (cat === 'data') return 'medium';
  if (cat === 'config') return 'medium';
  return 'low';
}

function categoryReviewerFocus(cat: ReturnType<typeof fileCategory>): string {
  if (cat === 'script')
    return 'Trace the logic path end-to-end. Ensure the agent did not silently change statistical assumptions or drop samples without justification.';
  if (cat === 'data')
    return 'Check row and column counts. Confirm the sample identifiers match the study design and no unexpected records were added or removed.';
  if (cat === 'config')
    return 'Verify all modified parameters are within accepted ranges. Flag any threshold or flag changes that could alter downstream results.';
  return 'Confirm the content is consistent with the code and data changes in this checkpoint.';
}

export function getSubmissionWalkthrough(detail: SubmissionDetail): SubmissionWalkthrough {
  const { submission, files } = detail;

  const fileInsights: Record<string, FileReviewInsight> = {};
  for (const f of files) {
    fileInsights[f.id] = deriveInsight(f);
  }

  // Group files by category into steps
  const groups = new Map<ReturnType<typeof fileCategory>, SubmissionFile[]>();
  for (const f of files) {
    const cat = fileCategory(f);
    if (!groups.has(cat)) groups.set(cat, []);
    groups.get(cat)!.push(f);
  }

  const ORDER: Array<ReturnType<typeof fileCategory>> = ['script', 'data', 'config', 'docs', 'other'];
  const steps: WalkthroughStep[] = [];
  for (const cat of ORDER) {
    const group = groups.get(cat);
    if (!group || group.length === 0) continue;
    const firstName = group[0].filename;
    steps.push({
      id: `step-${cat}`,
      kicker: categoryKicker(cat),
      risk: categoryRisk(cat),
      title:
        group.length === 1
          ? firstName
          : `${firstName} + ${group.length - 1} more`,
      summary:
        group.length === 1
          ? (group[0].message ?? `${group[0].action} — review the change below.`)
          : `${group.length} ${categoryKicker(cat).toLowerCase()} files changed in this checkpoint.`,
      fileIds: group.map(f => f.id),
      reviewerFocus: categoryReviewerFocus(cat),
    });
  }

  const totalFiles = files.length;
  const highRiskCount = steps.filter(s => s.risk === 'high').length;

  return {
    headline: submission.title,
    reviewerPromise: `This walkthrough guides you through ${steps.length} review ${steps.length === 1 ? 'step' : 'steps'} covering ${totalFiles} ${totalFiles === 1 ? 'file' : 'files'}.`,
    primaryQuestion:
      submission.description
        ? `Does this checkpoint achieve its stated goal? "${submission.description.slice(0, 120)}${submission.description.length > 120 ? '…' : ''}"`
        : "Does the agent's changes match the stated intent without unintended side effects?",
    steps,
    checklist: [
      'The statistical approach is unchanged unless justified.',
      'No samples are silently excluded or reordered.',
      'Output file paths and schemas are backward-compatible.',
      highRiskCount > 0 ? 'High-attention files have been reviewed first.' : 'All files match the described scope.',
      'The checkpoint can be merged without blocking downstream work.',
    ],
    splitSuggestion:
      steps.length > 2
        ? `This checkpoint touches ${steps.length} distinct areas. Consider splitting into separate reviews for each category to reduce risk.`
        : 'This checkpoint is focused enough to review in one pass.',
    fileInsights,
  };
}
