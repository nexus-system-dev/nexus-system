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

function parseTimestamp(value) {
  const normalized = normalizeString(value);
  if (!normalized) {
    return null;
  }

  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeBaselineEstimateMs(baselineEstimate) {
  const directNumber = normalizeFiniteNumber(baselineEstimate);
  if (directNumber !== null) {
    return directNumber >= 0 ? directNumber : null;
  }

  const normalizedEstimate = normalizeObject(baselineEstimate);
  const candidate =
    normalizeFiniteNumber(normalizedEstimate.baselineEstimateMs)
    ?? normalizeFiniteNumber(normalizedEstimate.durationMs)
    ?? normalizeFiniteNumber(normalizedEstimate.manualDurationMs)
    ?? null;

  return candidate !== null && candidate >= 0 ? candidate : null;
}

function buildAssignmentLookup(events = []) {
  const lookup = new Map();

  for (const event of normalizeArray(events)) {
    if (event?.type !== "task.assigned" || !event.id) {
      continue;
    }

    lookup.set(event.id, event);
  }

  return lookup;
}

function buildBaselineLookup(baselineEstimates = null) {
  if (baselineEstimates instanceof Map) {
    return baselineEstimates;
  }

  const normalizedBaselineEstimates = normalizeObject(baselineEstimates);
  return new Map(Object.entries(normalizedBaselineEstimates));
}

function resolveTaskType(result, assignmentEvent) {
  return normalizeString(result?.taskType)
    ?? normalizeString(assignmentEvent?.payload?.task?.taskType)
    ?? null;
}

function resolveExecutionDurationMs(result, assignmentEvent) {
  const assignedAt = parseTimestamp(assignmentEvent?.timestamp);
  const completedAt = parseTimestamp(result?.timestamp);
  if (assignedAt === null || completedAt === null) {
    return null;
  }

  const durationMs = completedAt - assignedAt;
  return durationMs >= 0 ? durationMs : null;
}

function resolveRecordedAt(result, assignmentEvent) {
  const resultTimestamp = parseTimestamp(result?.timestamp);
  if (resultTimestamp !== null) {
    return new Date(resultTimestamp).toISOString();
  }

  const assignmentTimestamp = parseTimestamp(assignmentEvent?.timestamp);
  if (assignmentTimestamp !== null) {
    return new Date(assignmentTimestamp).toISOString();
  }

  return null;
}

function buildMetricEntry(result, assignmentLookup, baselineLookup) {
  const assignmentEvent = assignmentLookup.get(result.assignmentEventId) ?? null;
  const baselineEstimate =
    baselineLookup.get(result.taskId ?? "")
    ?? baselineLookup.get(result.assignmentEventId ?? "")
    ?? null;

  return {
    timeSavedMetricEntryId: `time-saved-entry:${result.id ?? result.taskId ?? "unknown"}`,
    projectId: normalizeString(result.projectId) ?? normalizeString(assignmentEvent?.payload?.projectId),
    taskId: normalizeString(result.taskId),
    taskType: resolveTaskType(result, assignmentEvent),
    agentId: normalizeString(result.agentId) ?? normalizeString(assignmentEvent?.payload?.agentId),
    assignmentEventId: normalizeString(result.assignmentEventId),
    status: normalizeString(result.status) ?? "unknown",
    executionDurationMs: resolveExecutionDurationMs(result, assignmentEvent),
    baselineEstimateMs: normalizeBaselineEstimateMs(baselineEstimate),
    recordedAt: resolveRecordedAt(result, assignmentEvent),
  };
}

export function defineTimeSavedEstimationSchema({
  projectId = null,
  taskResults = [],
  events = [],
  baselineEstimates = null,
} = {}) {
  const normalizedTaskResults = normalizeArray(taskResults);
  const assignmentLookup = buildAssignmentLookup(events);
  const baselineLookup = buildBaselineLookup(baselineEstimates);

  return {
    timeSavedMetric: {
      timeSavedMetricId: `time-saved-metric:${normalizeString(projectId) ?? "unknown-project"}`,
      entries: normalizedTaskResults.map((result) => buildMetricEntry(result, assignmentLookup, baselineLookup)),
    },
  };
}
