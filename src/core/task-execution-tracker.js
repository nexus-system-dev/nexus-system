function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

export function createTaskExecutionTracker({
  taskExecutionMetric = null,
} = {}) {
  const normalizedMetric = taskExecutionMetric && typeof taskExecutionMetric === "object"
    ? taskExecutionMetric
    : {};
  const entries = normalizeArray(normalizedMetric.entries);

  const taskExecutionCounters = {
    totalCompleted: entries.filter((entry) => entry?.status === "completed").length,
    totalFailed: entries.filter((entry) => entry?.status === "failed").length,
    totalRetried: entries.filter((entry) => entry?.status === "retried").length,
    totalBlocked: entries.filter((entry) => entry?.status === "blocked").length,
  };

  return {
    taskExecutionCounters,
  };
}
