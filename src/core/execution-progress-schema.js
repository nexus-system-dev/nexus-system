function normalizeRuntimeLogs(runtimeLogs = []) {
  return Array.isArray(runtimeLogs) ? runtimeLogs.filter(Boolean) : [];
}

export function defineExecutionProgressSchema({
  taskExecutionState = null,
  runtimeLogs = [],
} = {}) {
  const normalizedLogs = normalizeRuntimeLogs(runtimeLogs);

  return {
    taskId: taskExecutionState?.taskId ?? null,
    runId: taskExecutionState?.runId ?? null,
    stageId: taskExecutionState?.stageId ?? null,
    status: taskExecutionState?.status ?? "unknown",
    progressPercent: taskExecutionState?.progressPercent ?? 0,
    startedAt: taskExecutionState?.startedAt ?? null,
    updatedAt: taskExecutionState?.updatedAt ?? null,
    completionEstimate: taskExecutionState?.completionEstimate ?? null,
    logCount: normalizedLogs.length,
    logSchema: {
      entries: normalizedLogs.map((log, index) => ({
        index,
        level: log.level ?? "info",
        message: log.message ?? String(log),
        timestamp: log.timestamp ?? null,
      })),
    },
  };
}
