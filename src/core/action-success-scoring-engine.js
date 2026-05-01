function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeNumber(value, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function resolveScore(status) {
  switch (status) {
    case "successful":
      return 1;
    case "mixed":
      return 0.5;
    case "failed":
      return 0;
    case "pending":
    default:
      return 0.25;
  }
}

function resolveBand(score) {
  if (score >= 0.85) {
    return "high";
  }

  if (score >= 0.45) {
    return "medium";
  }

  return "low";
}

export function createActionSuccessScoringEngine({
  projectId = null,
  outcomeEvaluation = null,
} = {}) {
  const normalizedOutcomeEvaluation = normalizeObject(outcomeEvaluation);
  const status = normalizeString(normalizedOutcomeEvaluation.status) ?? "pending";
  const summary = normalizeObject(normalizedOutcomeEvaluation.summary);
  const score = resolveScore(status);

  return {
    actionSuccessScore: {
      actionSuccessScoreId: `action-success-score:${normalizeString(projectId) ?? "unknown-project"}`,
      projectId: normalizeString(projectId),
      status,
      score,
      band: resolveBand(score),
      summary: {
        totalTaskResults: normalizeNumber(summary.totalTaskResults),
        totalCompleted: normalizeNumber(summary.totalCompleted),
        totalFailed: normalizeNumber(summary.totalFailed),
        totalRetried: normalizeNumber(summary.totalRetried),
        totalBlocked: normalizeNumber(summary.totalBlocked),
        totalTimeSavedMs: normalizeNumber(summary.totalTimeSavedMs),
      },
      sourceOutcomeEvaluationId: normalizeString(normalizedOutcomeEvaluation.outcomeEvaluationId),
      latestOutcomeStatus: normalizeString(normalizedOutcomeEvaluation.latestOutcome?.status),
    },
  };
}
