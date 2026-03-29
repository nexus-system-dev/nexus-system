function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createCockpitRecommendationSurface({
  projectExplanation = null,
  approvalExplanation = null,
  reasoningPanel = null,
  recommendationSummaryPanel = null,
} = {}) {
  const normalizedProjectExplanation = normalizeObject(projectExplanation);
  const normalizedApprovalExplanation = normalizeObject(approvalExplanation);
  const normalizedReasoningPanel = normalizeObject(reasoningPanel);
  const normalizedSummaryPanel = normalizeObject(recommendationSummaryPanel);

  return {
    cockpitRecommendationSurface: {
      surfaceId: `cockpit-recommendation-surface:${normalizedSummaryPanel.panelId ?? normalizedProjectExplanation.explanationId ?? "unknown"}`,
      headline: normalizedSummaryPanel.headline ?? normalizedProjectExplanation.headline ?? null,
      summary: normalizedProjectExplanation.userSummary ?? normalizedSummaryPanel.reason ?? null,
      whyNow: normalizedReasoningPanel.headline ?? null,
      approval: {
        requiresApproval: normalizedSummaryPanel.summary?.requiresApproval ?? false,
        whyApproval: normalizedApprovalExplanation.whyApproval ?? null,
        whatIfRejected: normalizedApprovalExplanation.whatIfRejected ?? null,
        riskLevel: normalizedApprovalExplanation.riskLevel ?? "unknown",
      },
      recommendationPanel: normalizedSummaryPanel,
      summaryMeta: {
        hasHeadline: Boolean(normalizedSummaryPanel.headline ?? normalizedProjectExplanation.headline),
        hasReasoning: Boolean(normalizedReasoningPanel.headline),
        requiresApproval: normalizedSummaryPanel.summary?.requiresApproval ?? false,
        blockerCount: normalizeArray(normalizedSummaryPanel.blockers).length,
      },
    },
  };
}
