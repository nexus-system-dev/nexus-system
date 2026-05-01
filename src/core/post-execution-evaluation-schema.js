function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function definePostExecutionEvaluationSchema({
  projectId = null,
  executionConsistencyReport = null,
  systemBottleneckSummary = null,
  outcomeFeedbackState = null,
  milestoneTracking = null,
} = {}) {
  const consistency = normalizeObject(executionConsistencyReport);
  const bottleneck = normalizeObject(systemBottleneckSummary);
  const feedback = normalizeObject(outcomeFeedbackState);
  const milestones = normalizeObject(milestoneTracking);
  const hasBlockingRisk = consistency.status === "inconsistent"
    || bottleneck.status === "blocked"
    || feedback.status === "attention-required";

  return {
    postExecutionEvaluation: {
      postExecutionEvaluationId: `post-execution-evaluation:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: hasBlockingRisk ? "review-required" : "healthy",
      checks: {
        consistencyStatus: normalizeString(consistency.status, "unknown"),
        bottleneckStatus: normalizeString(bottleneck.status, "unknown"),
        feedbackStatus: normalizeString(feedback.status, "unknown"),
        milestoneStatus: normalizeString(milestones.status, "unknown"),
      },
      summary: {
        consistencySummary: normalizeString(consistency.summary?.isConsistent === true ? "consistent" : consistency.status, "unknown"),
        bottleneckSummary: normalizeString(bottleneck.summary, "No bottleneck summary"),
        nextMilestone: normalizeString(milestones.nextMilestone),
      },
    },
  };
}
