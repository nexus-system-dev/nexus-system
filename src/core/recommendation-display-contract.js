function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildBlockers(projectExplanation, nextTaskPresentation) {
  const normalizedExplanation = normalizeObject(projectExplanation);
  const normalizedPresentation = normalizeObject(nextTaskPresentation);
  const blockers = [];

  if (normalizedPresentation.approvalState?.requiresApproval) {
    blockers.push("approval-required");
  }

  if (normalizedExplanation.summary?.hasFailure) {
    blockers.push("active-failure");
  }

  return blockers;
}

function buildPrimaryCta(nextTaskPresentation) {
  const normalizedPresentation = normalizeObject(nextTaskPresentation);
  const selectedTask = normalizeObject(normalizedPresentation.selectedTask);

  return {
    actionId: selectedTask.id ?? "review-recommendation",
    label: selectedTask.summary ?? normalizedPresentation.expectedOutcome?.headline ?? "Review recommendation",
    intent: normalizedPresentation.approvalState?.requiresApproval ? "approval" : "primary",
  };
}

export function createRecommendationDisplayContract({
  projectExplanation = null,
  reasoningPanel = null,
  nextTaskPresentation = null,
} = {}) {
  const normalizedExplanation = normalizeObject(projectExplanation);
  const normalizedReasoning = normalizeObject(reasoningPanel);
  const normalizedPresentation = normalizeObject(nextTaskPresentation);
  const blockers = buildBlockers(normalizedExplanation, normalizedPresentation);
  const alternatives = normalizeArray(normalizedPresentation.alternatives);
  const primaryCta = buildPrimaryCta(normalizedPresentation);

  return {
    recommendationDisplay: {
      displayId: `recommendation-display:${normalizedPresentation.presentationId ?? normalizedExplanation.explanationId ?? "unknown"}`,
      headline: normalizedExplanation.headline ?? normalizedPresentation.expectedOutcome?.headline ?? "Next recommendation",
      whyNow: normalizedReasoning.headline ?? normalizedExplanation.userSummary ?? null,
      expectedImpact: normalizedPresentation.expectedOutcome?.expectedImpact ?? null,
      blockers,
      alternatives,
      primaryCta,
      summary: {
        hasBlockers: blockers.length > 0,
        alternativeCount: alternatives.length,
        requiresApproval: normalizedPresentation.approvalState?.requiresApproval ?? false,
      },
    },
  };
}
