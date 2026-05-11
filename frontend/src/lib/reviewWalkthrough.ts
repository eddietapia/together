import type { Submission, SubmissionFile } from '@/types/submission';

export type ReviewRisk = 'low' | 'medium' | 'high';

export interface FileReviewInsight {
  role: string;
  value: string;
  reviewerFocus: string;
  evidence: string;
}

export interface WalkthroughStep {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  why: string;
  reviewerFocus: string;
  risk: ReviewRisk;
  fileIds: string[];
}

export interface SubmissionWalkthrough {
  headline: string;
  reviewerPromise: string;
  primaryQuestion: string;
  risk: ReviewRisk;
  splitSuggestion: string;
  checklist: string[];
  steps: WalkthroughStep[];
  fileInsights: Record<string, FileReviewInsight>;
}

const WALKTHROUGHS: Record<string, SubmissionWalkthrough> = {
  submission_1: {
    headline: 'Confirm the first DESeq2 result package is scientifically coherent.',
    reviewerPromise:
      'Start with the statistical settings, then inspect the result table, visual evidence, and written interpretation as one connected claim.',
    primaryQuestion:
      'Do the parameters, significant-gene table, plot, and narrative all support the claimed 847 differentially expressed genes?',
    risk: 'medium',
    splitSuggestion:
      'Keep this as one review: it is a compact first-pass analysis where config, outputs, and summary should be approved together.',
    checklist: [
      'DESeq2 parameters are explicit enough to reproduce the contrast.',
      'The DEG table contains the expected fold-change and p-value fields.',
      'The volcano plot visually agrees with the table and threshold choices.',
      'The summary describes findings without overstating biological certainty.',
    ],
    steps: [
      {
        id: 's1-method',
        title: 'Reproduce the setup',
        kicker: 'Start here',
        summary: 'Review the DESeq2 parameters before trusting any downstream output.',
        why: 'The first submission establishes the statistical contract for the whole RNA-seq review.',
        reviewerFocus: 'Check contrast, adjusted p-value threshold, fold-change cutoff, and sample groups.',
        risk: 'medium',
        fileIds: ['s1_f3'],
      },
      {
        id: 's1-results',
        title: 'Validate the core result',
        kicker: 'Evidence',
        summary: 'Inspect the DEG table and volcano plot as paired evidence.',
        why: 'The table is the quantitative source; the plot should make the same signal easy to audit.',
        reviewerFocus: 'Look for plausible p-values, clear up/down regulation, and no mismatch between table and plot.',
        risk: 'medium',
        fileIds: ['s1_f2', 's1_f1'],
      },
      {
        id: 's1-story',
        title: 'Read the interpretation',
        kicker: 'Decision',
        summary: 'Finish with the summary and decide whether it follows from the evidence.',
        why: 'A good report should explain what was found and what still needs validation.',
        reviewerFocus: 'Reject or comment if claims go beyond what the table and plot support.',
        risk: 'low',
        fileIds: ['s1_f4'],
      },
    ],
    fileInsights: {
      s1_f1: {
        role: 'Visual evidence for differential expression.',
        value: 'Makes the significant genes and effect sizes reviewable at a glance.',
        reviewerFocus: 'Confirm labeled/significant points align with the DEG table and threshold settings.',
        evidence: 'Compare against deg_results.csv and pipeline_params.json.',
      },
      s1_f2: {
        role: 'Primary quantitative output.',
        value: 'This is the source of truth behind the claimed 847 DEGs.',
        reviewerFocus: 'Check columns, adjusted p-values, log2 fold changes, and whether top genes look plausible.',
        evidence: 'Should explain the volcano plot and support the summary.',
      },
      s1_f3: {
        role: 'Reproducibility contract for the first analysis.',
        value: 'Documents the statistical method and thresholds used to generate every downstream file.',
        reviewerFocus: 'Verify the treatment/control contrast and significance settings are appropriate.',
        evidence: 'Use before judging deg_results.csv or volcano_plot.png.',
      },
      s1_f4: {
        role: 'Human-readable analysis narrative.',
        value: 'Turns raw DESeq2 outputs into reviewable conclusions and next steps.',
        reviewerFocus: 'Check that conclusions are grounded in the table and do not overclaim causality.',
        evidence: 'Should cite or reflect the DEG table and visual signal.',
      },
    },
  },
  submission_2: {
    headline: 'Verify an enrichment pass that changes thresholds and removes an intermediate file.',
    reviewerPromise:
      'Walk through the threshold change first, then review the regenerated heatmap, enrichment outputs, manuscript methods, and deletion.',
    primaryQuestion:
      'Is the broader enrichment analysis justified by the config change, and is the deleted normalized-counts file truly superseded?',
    risk: 'high',
    splitSuggestion:
      'Consider splitting if you disagree with the threshold change: config and regenerated heatmap are one decision, enrichment outputs are another, deletion is a third.',
    checklist: [
      'Significance threshold and correction method changes are intentional.',
      'The heatmap reflects the new normalization/clustering description.',
      'KEGG/GO enrichment results are sorted and interpretable.',
      'The methods text matches the actual parameters.',
      'Deleting normalized_counts.csv will not remove needed audit evidence.',
    ],
    steps: [
      {
        id: 's2-thresholds',
        title: 'Interrogate the threshold change',
        kicker: 'Risk hotspot',
        summary: 'The config moves from stricter Bonferroni-style filtering to broader FDR discovery.',
        why: 'This choice changes what downstream pathways can appear significant.',
        reviewerFocus: 'Decide whether 0.05 with Benjamini-Hochberg is acceptable for this analysis.',
        risk: 'high',
        fileIds: ['s2_f1'],
      },
      {
        id: 's2-visual',
        title: 'Check regenerated visual evidence',
        kicker: 'Before/after',
        summary: 'Review the updated heatmap after z-score normalization and clustering.',
        why: 'The visualization should reflect the new analysis settings rather than just look better.',
        reviewerFocus: 'Use diff/preview to confirm the heatmap change is expected and not misleading.',
        risk: 'medium',
        fileIds: ['s2_f2'],
      },
      {
        id: 's2-enrichment',
        title: 'Evaluate enrichment evidence',
        kicker: 'Core output',
        summary: 'Inspect the pathway table and methods together.',
        why: 'The table is only useful if the methods accurately describe how it was produced.',
        reviewerFocus: 'Check adjusted p-value ordering, pathway names, database sources, and methods consistency.',
        risk: 'medium',
        fileIds: ['s2_f3', 's2_f4'],
      },
      {
        id: 's2-delete',
        title: 'Approve or block deletion',
        kicker: 'Destructive',
        summary: 'Decide whether removing the normalized counts file preserves enough auditability.',
        why: 'Deletion is irreversible at merge time and may hide an intermediate needed for reproduction.',
        reviewerFocus: 'Reject if this file is still needed to validate the regenerated heatmap or enrichment.',
        risk: 'high',
        fileIds: ['s2_f5'],
      },
    ],
    fileInsights: {
      s2_f1: {
        role: 'Controls the broader enrichment result set.',
        value: 'Explains why more pathways can be discovered in this submission.',
        reviewerFocus: 'Scrutinize the p-value threshold and multiple-testing correction change.',
        evidence: 'Downstream heatmap and pathway table should be interpreted through this config.',
      },
      s2_f2: {
        role: 'Regenerated visual summary under new normalization.',
        value: 'Shows whether pathway-relevant genes cluster after z-score normalization.',
        reviewerFocus: 'Check that clustering improves interpretability without hiding sample structure.',
        evidence: 'Compare to config and methods claims.',
      },
      s2_f3: {
        role: 'Main enrichment result table.',
        value: 'Turns DEGs into biological pathway hypotheses.',
        reviewerFocus: 'Review adjusted p-values, database labels, and whether top pathways make biological sense.',
        evidence: 'Should align with methods.md and analysis_config.json.',
      },
      s2_f4: {
        role: 'Manuscript-ready methods description.',
        value: 'Documents enrichment databases, thresholds, and correction choices for readers.',
        reviewerFocus: 'Make sure it matches the actual config and does not omit the threshold change.',
        evidence: 'Cross-check against analysis_config.json and pathway_enrichment.csv.',
      },
      s2_f5: {
        role: 'Destructive cleanup of an intermediate dataset.',
        value: 'Reduces clutter only if final outputs fully replace it.',
        reviewerFocus: 'Approve only if normalized counts are not needed for reproducing the heatmap or enrichment.',
        evidence: 'Use current version preview and downstream outputs before approving deletion.',
      },
    },
  },
  submission_3: {
    headline: 'Audit sample quality control before accepting S07 as an outlier.',
    reviewerPromise:
      'Follow the sample metadata, batch-correction config, PCA evidence, and QC recommendation in that order.',
    primaryQuestion:
      'Does the evidence justify flagging S07 and enabling batch correction without compromising the cohort?',
    risk: 'high',
    splitSuggestion:
      'Keep metadata, config, PCA, and QC report together: approving only some of them could leave the project in an inconsistent QC state.',
    checklist: [
      'New QC columns are present and interpretable for all 12 samples.',
      'S07 is flagged based on metrics, not just downstream inconvenience.',
      'Batch correction settings match the documented sequencing-run issue.',
      'The PCA plot visibly supports the outlier/batch story.',
      'The QC report states a cautious recommendation rather than an automatic exclusion.',
    ],
    steps: [
      {
        id: 's3-sample',
        title: 'Inspect sample-level evidence',
        kicker: 'Start with data',
        summary: 'Review the metadata update that adds QC metrics and flags S07.',
        why: 'Outlier decisions should originate from sample-level evidence, not just downstream plots.',
        reviewerFocus: 'Look for complete RIN, mapping, duplicate-rate, and outlier fields across all samples.',
        risk: 'high',
        fileIds: ['s3_f1'],
      },
      {
        id: 's3-correction',
        title: 'Validate correction settings',
        kicker: 'Method change',
        summary: 'Confirm ComBat-seq and outlier thresholds are configured intentionally.',
        why: 'Batch correction can help or harm depending on how it is parameterized.',
        reviewerFocus: 'Check batch labels, detection thresholds, and whether S07 is excluded or only flagged.',
        risk: 'high',
        fileIds: ['s3_f2'],
      },
      {
        id: 's3-visual',
        title: 'Review PCA support',
        kicker: 'Visual proof',
        summary: 'Use the PCA plot to see whether S07 separates in PC1 as claimed.',
        why: 'The plot should make the QC concern easy to validate without reading every metric.',
        reviewerFocus: 'Check whether S07 is uniquely separated and whether batch effects remain visible.',
        risk: 'medium',
        fileIds: ['s3_f3'],
      },
      {
        id: 's3-report',
        title: 'Decide on recommendation',
        kicker: 'Human judgment',
        summary: 'Read the QC report after inspecting the underlying evidence.',
        why: 'The final report should explain uncertainty and recommend next action responsibly.',
        reviewerFocus: 'Confirm it distinguishes flagging S07 from definitively removing it.',
        risk: 'medium',
        fileIds: ['s3_f4'],
      },
    ],
    fileInsights: {
      s3_f1: {
        role: 'Sample-level QC evidence.',
        value: 'Adds the metrics that justify or weaken the S07 outlier claim.',
        reviewerFocus: 'Check all samples have populated QC fields and S07 is not singled out without evidence.',
        evidence: 'Should support the PCA plot and QC report recommendation.',
      },
      s3_f2: {
        role: 'Batch-correction and outlier-detection settings.',
        value: 'Determines how the pipeline will respond to the discovered QC issue.',
        reviewerFocus: 'Verify ComBat-seq settings and thresholds are appropriate for 12 samples.',
        evidence: 'Should match metadata batch columns and report language.',
      },
      s3_f3: {
        role: 'Visual outlier evidence.',
        value: 'Shows whether S07 separates from the rest of the cohort in principal-component space.',
        reviewerFocus: 'Confirm S07 is clearly marked and the axis/story match the QC report.',
        evidence: 'Cross-check with sample_metadata.csv and qc_report.md.',
      },
      s3_f4: {
        role: 'QC decision memo.',
        value: 'Summarizes metrics and recommends how to handle S07.',
        reviewerFocus: 'Look for careful language around exclusion, rerun, or follow-up validation.',
        evidence: 'Should cite metadata metrics and PCA behavior.',
      },
    },
  },
  submission_4: {
    headline: 'Review the full publication-ready analysis bundle without losing the thread.',
    reviewerPromise:
      'Move from source matrix to parameters, figures, pathway tables, and supplementary methods so the big bundle stays reviewable.',
    primaryQuestion:
      'Do the expanded outputs form a consistent, reproducible final analysis package?',
    risk: 'medium',
    splitSuggestion:
      'This is a good candidate to split: data matrix, figure set, pathway tables, and supplementary methods could be separate reviews if the bundle feels too large.',
    checklist: [
      'The full matrix is complete and plausibly sized for 1,000 genes x 12 samples.',
      'DESeq2 parameters include enough detail for reproduction.',
      'Figures are consistent with the same analysis and naming conventions.',
      'GO and KEGG tables are complementary rather than duplicative/conflicting.',
      'Supplementary methods accurately summarize all generated outputs.',
    ],
    steps: [
      {
        id: 's4-data',
        title: 'Anchor on the full matrix',
        kicker: 'Data foundation',
        summary: 'Start with the complete normalized expression matrix.',
        why: 'Every figure and enrichment table ultimately depends on this data layer.',
        reviewerFocus: 'Spot-check dimensions, sample columns, and whether values look normalized.',
        risk: 'medium',
        fileIds: ['s4_f1'],
      },
      {
        id: 's4-params',
        title: 'Confirm analysis parameters',
        kicker: 'Reproducibility',
        summary: 'Inspect DESeq2 size factors, contrasts, and parameter details.',
        why: 'The expanded bundle needs stronger provenance than the first-pass submission.',
        reviewerFocus: 'Check contrast definitions and software/parameter detail.',
        risk: 'medium',
        fileIds: ['s4_f5'],
      },
      {
        id: 's4-figures',
        title: 'Review figure suite',
        kicker: 'Visual pass',
        summary: 'Evaluate volcano, heatmap, and MA plots as a coherent figure set.',
        why: 'The figures should each explain a different aspect of the same result set.',
        reviewerFocus: 'Check labeling, clustering, significance annotations, and visual consistency.',
        risk: 'medium',
        fileIds: ['s4_f2', 's4_f3', 's4_f4'],
      },
      {
        id: 's4-pathways',
        title: 'Compare pathway databases',
        kicker: 'Biology layer',
        summary: 'Review GO and KEGG tables together.',
        why: 'The pathway tables should broaden interpretation without contradicting each other.',
        reviewerFocus: 'Look for reasonable term/pathway overlap, adjusted p-values, and clear database labeling.',
        risk: 'medium',
        fileIds: ['s4_f7', 's4_f8'],
      },
      {
        id: 's4-methods',
        title: 'Finalize supplementary methods',
        kicker: 'Publication polish',
        summary: 'Read the methods last after you know what outputs exist.',
        why: 'The methods should be complete enough to reproduce the whole bundle.',
        reviewerFocus: 'Check software versions, parameters, sample handling, and references to generated figures/tables.',
        risk: 'low',
        fileIds: ['s4_f6'],
      },
    ],
    fileInsights: {
      s4_f1: {
        role: 'Complete expression data foundation.',
        value: 'Provides the full 1,000 gene by 12 sample matrix behind the publication bundle.',
        reviewerFocus: 'Spot-check headers, dimensions, and normalization plausibility.',
        evidence: 'Should support every figure and downstream enrichment result.',
      },
      s4_f2: {
        role: 'Enhanced significance/effect-size visualization.',
        value: 'Adds labeled genes and annotations for communication-ready review.',
        reviewerFocus: 'Check labels are not cherry-picked and match the DEG story.',
        evidence: 'Should be consistent with DESeq2 params and expression matrix.',
      },
      s4_f3: {
        role: 'Clustered top-gene expression view.',
        value: 'Shows whether top DEGs separate samples in an interpretable way.',
        reviewerFocus: 'Inspect clustering and sample labels for overinterpretation.',
        evidence: 'Should derive from the full matrix and DESeq2 choices.',
      },
      s4_f4: {
        role: 'MA plot quality check.',
        value: 'Complements the volcano plot by showing fold change across expression levels.',
        reviewerFocus: 'Look for bias patterns or unusual spread at low expression.',
        evidence: 'Should match the same contrast and normalization assumptions.',
      },
      s4_f5: {
        role: 'Detailed reproducibility metadata.',
        value: 'Captures DESeq2 parameters, size factors, and contrast definitions.',
        reviewerFocus: 'Verify parameters are complete enough to rerun the figures and tables.',
        evidence: 'Use before approving the final methods section.',
      },
      s4_f6: {
        role: 'Publication-ready supplementary method.',
        value: 'Turns the full analysis bundle into a reproducible manuscript artifact.',
        reviewerFocus: 'Check it mentions the actual software versions, parameters, and generated outputs.',
        evidence: 'Should align with deseq2_params.json, figures, and pathway tables.',
      },
      s4_f7: {
        role: 'Gene Ontology interpretation table.',
        value: 'Summarizes functional themes from significant genes.',
        reviewerFocus: 'Check term names, adjusted p-values, and biological plausibility.',
        evidence: 'Compare with KEGG results for complementary signal.',
      },
      s4_f8: {
        role: 'KEGG pathway interpretation table.',
        value: 'Adds pathway-level context alongside GO terms.',
        reviewerFocus: 'Check pathway names, adjusted p-values, and overlap with GO findings.',
        evidence: 'Should complement gene_ontology.csv and methods text.',
      },
    },
  },
  submission_5: {
    headline: 'Stress-test a re-analysis that removes S07 and changes covariates.',
    reviewerPromise:
      'Review this like a sensitivity analysis: config first, then empty result, deep provenance, protocol, and execution log.',
    primaryQuestion:
      'Does removing S07 and adding covariates responsibly explain why no genes remain significant at p < 0.001?',
    risk: 'high',
    splitSuggestion:
      'Split if needed into sensitivity-analysis result, provenance/config package, and documentation/log package. The config plus empty result should stay together.',
    checklist: [
      'S07 exclusion and sex covariate are explicitly configured.',
      'The empty result is expected under the stricter p-value interpretation.',
      'Nested config captures enough tool versions and parameters for provenance.',
      'Protocol document supports the experimental context.',
      'Execution log contains no unresolved warnings that undermine the empty result.',
    ],
    steps: [
      {
        id: 's5-config',
        title: 'Review sensitivity settings',
        kicker: 'Start here',
        summary: 'Inspect S07 exclusion, sex covariate addition, and log2FC cutoff change.',
        why: 'These choices explain why the re-analysis can contradict earlier significant results.',
        reviewerFocus: 'Confirm the settings match the stated sensitivity-analysis intent.',
        risk: 'high',
        fileIds: ['s5_f1'],
      },
      {
        id: 's5-empty',
        title: 'Validate the empty result',
        kicker: 'Surprising output',
        summary: 'Treat the empty CSV as a result that requires explanation, not a missing output.',
        why: 'No significant genes at p < 0.001 is meaningful if the re-analysis was configured correctly.',
        reviewerFocus: 'Check headers and confirm the empty result aligns with the config and log.',
        risk: 'high',
        fileIds: ['s5_f2'],
      },
      {
        id: 's5-provenance',
        title: 'Inspect deep provenance',
        kicker: 'Audit trail',
        summary: 'Review nested pipeline config for versions and full parameters.',
        why: 'A sensitivity analysis is only persuasive if it can be reproduced exactly.',
        reviewerFocus: 'Check tool versions, nested parameters, and consistency with analysis_config.json.',
        risk: 'medium',
        fileIds: ['s5_f3'],
      },
      {
        id: 's5-docs',
        title: 'Check protocol context',
        kicker: 'Documentation',
        summary: 'Open the protocol to verify the experiment context used by the analysis.',
        why: 'Protocol context can explain covariates, sample handling, and whether S07 exclusion is reasonable.',
        reviewerFocus: 'Look for sample design, covariates, and protocol constraints.',
        risk: 'medium',
        fileIds: ['s5_f4'],
      },
      {
        id: 's5-log',
        title: 'Read execution warnings last',
        kicker: 'Final confidence',
        summary: 'Use the log to catch failures that would invalidate the empty result.',
        why: 'An empty result is only acceptable if the pipeline completed cleanly.',
        reviewerFocus: 'Scan for warnings, errors, excluded samples, and final completion markers.',
        risk: 'high',
        fileIds: ['s5_f5'],
      },
    ],
    fileInsights: {
      s5_f1: {
        role: 'Sensitivity-analysis control panel.',
        value: 'Documents S07 exclusion, sex covariate, and threshold/cutoff decisions.',
        reviewerFocus: 'Verify changes are intentional and scientifically justified.',
        evidence: 'Should explain the empty sensitivity result and match execution log.',
      },
      s5_f2: {
        role: 'Negative result artifact.',
        value: 'Shows no genes pass the stricter sensitivity analysis after removing S07.',
        reviewerFocus: 'Confirm this is a valid empty table, not a failed export.',
        evidence: 'Needs support from config and analysis_log.txt.',
      },
      s5_f3: {
        role: 'Deep reproducibility package.',
        value: 'Captures full nested pipeline parameters and tool versions.',
        reviewerFocus: 'Look for mismatches with the simpler analysis config.',
        evidence: 'Should make the sensitivity result rerunnable.',
      },
      s5_f4: {
        role: 'Experimental protocol reference.',
        value: 'Provides context for sample design and covariate choices.',
        reviewerFocus: 'Check whether the protocol supports S07 exclusion and sex covariate inclusion.',
        evidence: 'Use alongside analysis_config.json and QC history.',
      },
      s5_f5: {
        role: 'Execution trace for the re-analysis.',
        value: 'Shows whether the pipeline ran cleanly and how warnings were handled.',
        reviewerFocus: 'Scan for errors, warnings, sample exclusion messages, and successful completion.',
        evidence: 'Should corroborate empty_results.csv rather than explain it away as a failure.',
      },
    },
  },
};

const RISK_RANK: Record<ReviewRisk, number> = { low: 0, medium: 1, high: 2 };

function inferRisk(files: SubmissionFile[]): ReviewRisk {
  if (files.some(file => file.action === 'deleted')) return 'high';
  if (files.some(file => file.action === 'updated')) return 'medium';
  return 'low';
}

function genericWalkthrough(submission: Submission, files: SubmissionFile[]): SubmissionWalkthrough {
  const risk = inferRisk(files);
  return {
    headline: `Verify ${submission.title.toLowerCase()} as a coherent change set.`,
    reviewerPromise:
      'Review setup changes first, then generated outputs, then final documentation and destructive actions.',
    primaryQuestion: 'Do the changed files collectively support the submitted objective?',
    risk,
    splitSuggestion:
      files.length > 6
        ? 'This is large enough to consider splitting by file type or folder.'
        : 'This review is small enough to keep together unless you find unrelated changes.',
    checklist: [
      'Config or setup changes explain downstream outputs.',
      'Generated artifacts match the stated submission intent.',
      'Documentation describes the actual files and parameters.',
      'Any deletion is intentional and safe.',
    ],
    steps: [
      {
        id: 'generic-all',
        title: 'Review all files',
        kicker: 'Guided pass',
        summary: 'No tailored walkthrough exists yet, so review this submission as one coherent file set.',
        why: 'The files should still be judged against the submission objective.',
        reviewerFocus: 'Look for unrelated files, missing evidence, or unsupported claims.',
        risk,
        fileIds: files.map(file => file.id),
      },
    ],
    fileInsights: Object.fromEntries(
      files.map(file => [
        file.id,
        {
          role: `${file.action[0].toUpperCase()}${file.action.slice(1)} file in this review.`,
          value: file.message ?? 'Supports the submitted change set.',
          reviewerFocus: 'Confirm this file belongs in the submission and matches the stated intent.',
          evidence: `Target path: ${file.targetPath}`,
        },
      ]),
    ),
  };
}

export function getSubmissionWalkthrough(
  submission: Submission,
  files: SubmissionFile[],
): SubmissionWalkthrough {
  const tailored = WALKTHROUGHS[submission.id];
  if (!tailored) return genericWalkthrough(submission, files);

  const knownFileIds = new Set(files.map(file => file.id));
  return {
    ...tailored,
    risk: tailored.steps.reduce(
      (max, step) => (RISK_RANK[step.risk] > RISK_RANK[max] ? step.risk : max),
      tailored.risk,
    ),
    steps: tailored.steps.map(step => ({
      ...step,
      fileIds: step.fileIds.filter(fileId => knownFileIds.has(fileId)),
    })),
  };
}
