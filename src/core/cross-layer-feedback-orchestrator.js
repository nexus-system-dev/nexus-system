function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createCrossLayerFeedbackOrchestrator({
  projectId = null,
  postExecutionReport = null,
  productIterationInsights = null,
  goalProgressState = null,
  milestoneTracking = null,
} = {}) {
  const report = normalizeObject(postExecutionReport);
  const insights = normalizeObject(productIterationInsights);
  const goalProgress = normalizeObject(goalProgressState);
  const milestones = normalizeObject(milestoneTracking);
  const recommendations = normalizeArray(insights.recommendations);

  return {
    crossLayerFeedbackState: {
      crossLayerFeedbackStateId: `cross-layer-feedback:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: report.status === "needs-review" ? "intervention" : "coordinated",
      nextPriority: report.nextAction ?? goalProgress.nextMilestone ?? null,
      feedbackActions: recommendations.slice(0, 3).map((entry) => entry.actionType),
      summary: {
        recommendationCount: recommendations.length,
        goalHealth: normalizeString(goalProgress.goalHealth, "unknown"),
        milestoneStatus: normalizeString(milestones.status, "unknown"),
      },
    },
  };
}
