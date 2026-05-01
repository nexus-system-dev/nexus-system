function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export function createAdaptiveExecutionLoop({
  projectId = null,
  crossLayerFeedbackState = null,
  activeBottleneck = null,
  taskThroughputSummary = null,
  progressState = null,
} = {}) {
  const feedback = normalizeObject(crossLayerFeedbackState);
  const bottleneck = normalizeObject(activeBottleneck);
  const throughput = normalizeObject(taskThroughputSummary);
  const progress = normalizeObject(progressState);
  const totalBlocked = normalizeNumber(throughput.totalBlocked);
  const loopMode = totalBlocked > 0 || feedback.status === "intervention" ? "stabilize" : "accelerate";

  return {
    adaptiveExecutionDecision: {
      adaptiveExecutionDecisionId: `adaptive-execution:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: "ready",
      loopMode,
      nextAction: bottleneck.summary?.isBlocking === true
        ? "resolve-active-bottleneck"
        : feedback.nextPriority ?? normalizeString(progress.status, "continue"),
      guardrails: [
        "preserve-approval-safety",
        "preserve-tenant-boundaries",
        "preserve-review-gates",
      ],
    },
  };
}
