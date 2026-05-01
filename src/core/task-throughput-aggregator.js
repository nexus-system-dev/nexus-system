function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeCount(value) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : 0;
}

function buildCountBucket(entries, keyResolver) {
  const bucket = {};

  for (const entry of normalizeArray(entries)) {
    const key = keyResolver(entry);
    if (!key) {
      continue;
    }

    bucket[key] = (bucket[key] ?? 0) + 1;
  }

  return bucket;
}

function resolveDayKey(entry) {
  const timestamp = normalizeString(entry?.timestamp);
  if (!timestamp) {
    return null;
  }

  const parsed = Date.parse(timestamp);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return new Date(parsed).toISOString().slice(0, 10);
}

export function createTaskThroughputAggregator({
  taskExecutionMetric = null,
  taskExecutionCounters = null,
} = {}) {
  const normalizedMetric = normalizeObject(taskExecutionMetric);
  const entries = normalizeArray(normalizedMetric.entries);
  const normalizedCounters = normalizeObject(taskExecutionCounters);

  return {
    taskThroughputSummary: {
      totalCompleted: normalizeCount(normalizedCounters.totalCompleted),
      totalFailed: normalizeCount(normalizedCounters.totalFailed),
      totalRetried: normalizeCount(normalizedCounters.totalRetried),
      totalBlocked: normalizeCount(normalizedCounters.totalBlocked),
      byProject: buildCountBucket(entries, (entry) => normalizeString(entry?.projectId)),
      byLane: buildCountBucket(entries, (entry) => normalizeString(entry?.lane)),
      byAgent: buildCountBucket(entries, (entry) => normalizeString(entry?.agentId)),
      byDay: buildCountBucket(entries, resolveDayKey),
    },
  };
}
