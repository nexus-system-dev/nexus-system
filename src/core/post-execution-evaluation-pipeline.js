function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createPostExecutionEvaluationPipeline({
  projectId = null,
  postExecutionEvaluation = null,
  executionConsistencyReport = null,
  systemBottleneckSummary = null,
} = {}) {
  const evaluation = normalizeObject(postExecutionEvaluation);
  const consistency = normalizeObject(executionConsistencyReport);
  const bottleneck = normalizeObject(systemBottleneckSummary);
  const requiresManualReview = evaluation.status === "review-required" || consistency.summary?.requiresManualReview === true;

  return {
    postExecutionReport: {
      postExecutionReportId: `post-execution-report:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: requiresManualReview ? "needs-review" : "ready",
      riskLevel: bottleneck.severity ?? "low",
      requiresManualReview,
      nextAction: requiresManualReview ? "review-and-unblock" : "continue-execution",
      summary: {
        evaluationStatus: normalizeString(evaluation.status, "unknown"),
        consistencyStatus: normalizeString(consistency.status, "unknown"),
        bottleneckType: normalizeString(bottleneck.bottleneckType, "none"),
      },
    },
  };
}
