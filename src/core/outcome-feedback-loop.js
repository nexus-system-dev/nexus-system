function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createOutcomeFeedbackLoop({
  projectId = null,
  outcomeEvaluation = null,
  actionSuccessScore = null,
  taskThroughputSummary = null,
  productivitySummary = null,
} = {}) {
  const evaluation = normalizeObject(outcomeEvaluation);
  const scoreState = normalizeObject(actionSuccessScore);
  const throughput = normalizeObject(taskThroughputSummary);
  const productivity = normalizeObject(productivitySummary);
  const score = normalizeNumber(scoreState.score, 0.25);
  const totalBlocked = normalizeNumber(throughput.totalBlocked);
  const totalFailed = normalizeNumber(throughput.totalFailed);
  const totalRetried = normalizeNumber(throughput.totalRetried);
  const totalCompleted = normalizeNumber(throughput.totalCompleted);
  const totalTimeSavedMs = normalizeNumber(productivity.totalTimeSavedMs);
  const needsIntervention = totalBlocked > 0 || totalFailed > 0 || score < 0.5;

  return {
    outcomeFeedbackState: {
      outcomeFeedbackStateId: `outcome-feedback:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: needsIntervention ? "attention-required" : "stable",
      score,
      trend: totalCompleted > totalFailed + totalBlocked ? "improving" : needsIntervention ? "stalled" : "steady",
      summary: {
        outcomeStatus: normalizeString(evaluation.status, "pending"),
        totalCompleted,
        totalFailed,
        totalRetried,
        totalBlocked,
        totalTimeSavedMs,
        requiresIntervention: needsIntervention,
      },
      recommendedFocusAreas: [
        totalBlocked > 0 ? "dependency-unblock" : null,
        totalFailed > 0 ? "execution-quality" : null,
        totalRetried > 0 ? "retry-reduction" : null,
        totalTimeSavedMs <= 0 ? "throughput-efficiency" : null,
      ].filter(Boolean),
    },
  };
}
