function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function buildLatestOutcome(taskResults = []) {
  const latest = [...normalizeArray(taskResults)]
    .sort((left, right) => {
      const leftTimestamp = normalizeString(left?.timestamp) ?? "";
      const rightTimestamp = normalizeString(right?.timestamp) ?? "";
      if (leftTimestamp !== rightTimestamp) {
        return rightTimestamp.localeCompare(leftTimestamp);
      }
      return (normalizeString(right?.id) ?? "").localeCompare(normalizeString(left?.id) ?? "");
    })
    .at(0);

  if (!latest) {
    return null;
  }

  return {
    eventId: normalizeString(latest.id),
    taskId: normalizeString(latest.taskId),
    taskType: normalizeString(latest.taskType),
    agentId: normalizeString(latest.agentId),
    assignmentEventId: normalizeString(latest.assignmentEventId),
    status: normalizeString(latest.status) ?? "unknown",
    timestamp: normalizeString(latest.timestamp),
  };
}

function resolveOutcomeStatus(taskResults = [], throughputSummary = {}) {
  const normalizedTaskResults = normalizeArray(taskResults);
  const totals = normalizeObject(throughputSummary);
  const totalCompleted = typeof totals.totalCompleted === "number" ? totals.totalCompleted : normalizedTaskResults.filter((entry) => entry?.status === "completed").length;
  const totalFailed = typeof totals.totalFailed === "number" ? totals.totalFailed : normalizedTaskResults.filter((entry) => entry?.status === "failed").length;
  const totalRetried = typeof totals.totalRetried === "number" ? totals.totalRetried : normalizedTaskResults.filter((entry) => entry?.status === "retried").length;
  const totalBlocked = typeof totals.totalBlocked === "number" ? totals.totalBlocked : 0;

  if (totalFailed > 0 && totalCompleted === 0) {
    return "failed";
  }

  if (totalFailed > 0 || totalBlocked > 0 || totalRetried > 0) {
    return "mixed";
  }

  if (totalCompleted > 0) {
    return "successful";
  }

  return "pending";
}

function buildEvidence(taskResults = []) {
  return normalizeArray(taskResults).map((result) => ({
    eventId: normalizeString(result.id),
    taskId: normalizeString(result.taskId),
    taskType: normalizeString(result.taskType),
    status: normalizeString(result.status) ?? "unknown",
    timestamp: normalizeString(result.timestamp),
  }));
}

export function defineOutcomeEvaluationSchema({
  projectId = null,
  taskResults = [],
  taskExecutionMetric = null,
  taskThroughputSummary = null,
  productivitySummary = null,
} = {}) {
  const normalizedTaskResults = normalizeArray(taskResults);
  const normalizedMetric = normalizeObject(taskExecutionMetric);
  const normalizedThroughputSummary = normalizeObject(taskThroughputSummary);
  const normalizedProductivitySummary = normalizeObject(productivitySummary);
  const latestOutcome = buildLatestOutcome(normalizedTaskResults);
  const status = resolveOutcomeStatus(normalizedTaskResults, normalizedThroughputSummary);

  return {
    outcomeEvaluation: {
      outcomeEvaluationId: `outcome-evaluation:${normalizeString(projectId) ?? "unknown-project"}`,
      projectId: normalizeString(projectId),
      status,
      latestOutcome,
      summary: {
        totalTaskResults: normalizedTaskResults.length,
        totalEvaluatedEntries: normalizeArray(normalizedMetric.entries).length,
        totalCompleted: typeof normalizedThroughputSummary.totalCompleted === "number" ? normalizedThroughputSummary.totalCompleted : 0,
        totalFailed: typeof normalizedThroughputSummary.totalFailed === "number" ? normalizedThroughputSummary.totalFailed : 0,
        totalRetried: typeof normalizedThroughputSummary.totalRetried === "number" ? normalizedThroughputSummary.totalRetried : 0,
        totalBlocked: typeof normalizedThroughputSummary.totalBlocked === "number" ? normalizedThroughputSummary.totalBlocked : 0,
        totalTimeSavedMs: typeof normalizedProductivitySummary.totalTimeSavedMs === "number" ? normalizedProductivitySummary.totalTimeSavedMs : 0,
      },
      evidence: buildEvidence(normalizedTaskResults),
    },
  };
}
