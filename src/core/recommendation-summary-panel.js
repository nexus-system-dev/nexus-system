function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveUrgency(recommendationDisplay, projectBrainWorkspace) {
  const normalizedDisplay = normalizeObject(recommendationDisplay);
  const normalizedWorkspace = normalizeObject(projectBrainWorkspace);

  if (normalizedDisplay.summary?.requiresApproval) {
    return "high";
  }

  if ((normalizedWorkspace.blockers ?? []).length > 0) {
    return "medium";
  }

  return "normal";
}

export function createRecommendationSummaryPanel({
  recommendationDisplay = null,
  projectBrainWorkspace = null,
} = {}) {
  const normalizedDisplay = normalizeObject(recommendationDisplay);
  const normalizedWorkspace = normalizeObject(projectBrainWorkspace);
  const urgency = resolveUrgency(normalizedDisplay, normalizedWorkspace);

  return {
    recommendationSummaryPanel: {
      panelId: `recommendation-summary-panel:${normalizedDisplay.displayId ?? "unknown"}`,
      title: "Active Recommendation",
      headline: normalizedDisplay.headline ?? null,
      reason: normalizedDisplay.whyNow ?? null,
      urgency,
      expectedOutcome: normalizedDisplay.expectedImpact ?? null,
      blockers: normalizeArray(normalizedDisplay.blockers),
      primaryCta: normalizedDisplay.primaryCta ?? null,
      summary: {
        blockerCount: normalizeArray(normalizedDisplay.blockers).length,
        alternativeCount: normalizeArray(normalizedDisplay.alternatives).length,
        requiresApproval: normalizedDisplay.summary?.requiresApproval ?? false,
      },
    },
  };
}
