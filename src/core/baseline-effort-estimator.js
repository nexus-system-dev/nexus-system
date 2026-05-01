const TASK_TYPE_TO_BASELINE_MS = Object.freeze({
  backend: 1800000,
  frontend: 1500000,
  growth: 1200000,
  mobile: 2100000,
  ops: 900000,
  release: 900000,
});

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function resolveBaselineEstimateMs(taskType) {
  const normalizedTaskType = normalizeString(taskType);
  if (!normalizedTaskType) {
    return null;
  }

  return TASK_TYPE_TO_BASELINE_MS[normalizedTaskType] ?? null;
}

function buildEstimateEntry(result) {
  return {
    baselineEstimateEntryId: `baseline-estimate-entry:${result.id ?? result.taskId ?? "unknown"}`,
    taskId: normalizeString(result.taskId),
    taskType: normalizeString(result.taskType),
    assignmentEventId: normalizeString(result.assignmentEventId),
    baselineEstimateMs: resolveBaselineEstimateMs(result.taskType),
  };
}

export function createBaselineEffortEstimator({
  projectId = null,
  taskResults = [],
  domain = null,
  context = null,
} = {}) {
  const entries = normalizeArray(taskResults).map((result) => buildEstimateEntry(result));

  return {
    baselineEstimate: {
      baselineEstimateId: `baseline-estimate:${normalizeString(projectId) ?? "unknown-project"}`,
      entries,
      defaults: { ...TASK_TYPE_TO_BASELINE_MS },
      domain: normalizeString(domain),
      contextUsed: false,
      summary:
        entries.length === 0
          ? "Baseline estimate resolved with Wave 2 taskType defaults and no executed task results."
          : "Baseline estimate resolved with Wave 2 taskType defaults only.",
    },
  };
}
