function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function resolveTimeSavedMs(entry) {
  const baselineEstimateMs = normalizeFiniteNumber(entry?.baselineEstimateMs);
  const executionDurationMs = normalizeFiniteNumber(entry?.executionDurationMs);

  if (baselineEstimateMs === null || executionDurationMs === null) {
    return null;
  }

  return Math.max(baselineEstimateMs - executionDurationMs, 0);
}

function buildTimeSavedEntry(entry) {
  const normalizedEntry = normalizeObject(entry);

  return {
    timeSavedEntryId: `time-saved-result:${normalizedEntry.timeSavedMetricEntryId ?? normalizedEntry.taskId ?? "unknown"}`,
    projectId: normalizeString(normalizedEntry.projectId),
    taskId: normalizeString(normalizedEntry.taskId),
    taskType: normalizeString(normalizedEntry.taskType),
    agentId: normalizeString(normalizedEntry.agentId),
    assignmentEventId: normalizeString(normalizedEntry.assignmentEventId),
    status: normalizeString(normalizedEntry.status) ?? "unknown",
    executionDurationMs: normalizeFiniteNumber(normalizedEntry.executionDurationMs),
    baselineEstimateMs: normalizeFiniteNumber(normalizedEntry.baselineEstimateMs),
    timeSavedMs: resolveTimeSavedMs(normalizedEntry),
    recordedAt: normalizeString(normalizedEntry.recordedAt),
  };
}

export function createTimeSavedCalculator({
  projectId = null,
  timeSavedMetric = null,
} = {}) {
  const normalizedMetric = normalizeObject(timeSavedMetric);
  const entries = normalizeArray(normalizedMetric.entries).map((entry) => buildTimeSavedEntry(entry));

  return {
    timeSaved: {
      timeSavedId: `time-saved:${normalizeString(projectId) ?? "unknown-project"}`,
      entries,
    },
  };
}
