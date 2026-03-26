function normalizeRuntimeEvents(runtimeEvents) {
  return runtimeEvents && typeof runtimeEvents === "object" ? runtimeEvents : {};
}

function normalizeRequestContext(requestContext) {
  return requestContext && typeof requestContext === "object" ? requestContext : {};
}

function normalizeLogEntries(runtimeEvents) {
  if (Array.isArray(runtimeEvents.formattedLogs) && runtimeEvents.formattedLogs.length > 0) {
    return runtimeEvents.formattedLogs;
  }

  if (Array.isArray(runtimeEvents.logEntries) && runtimeEvents.logEntries.length > 0) {
    return runtimeEvents.logEntries;
  }

  return [];
}

function buildTraceSteps(runtimeEvents) {
  const executionEvents = Array.isArray(runtimeEvents.executionEvents) ? runtimeEvents.executionEvents : [];
  const progressEntries = Array.isArray(runtimeEvents.progressEntries) ? runtimeEvents.progressEntries : [];

  return [...progressEntries, ...executionEvents].map((entry, index) => ({
    stepId: entry.stepId ?? entry.id ?? `trace-step-${index + 1}`,
    source: entry.source ?? entry.type ?? "runtime",
    status: entry.status ?? "observed",
    timestamp: entry.timestamp ?? null,
    message: entry.message ?? null,
  }));
}

export function createPlatformLoggingAndTracingLayer({
  runtimeEvents = null,
  requestContext = null,
} = {}) {
  const normalizedRuntimeEvents = normalizeRuntimeEvents(runtimeEvents);
  const normalizedRequestContext = normalizeRequestContext(requestContext);
  const platformLogs = normalizeLogEntries(normalizedRuntimeEvents);
  const traceSteps = buildTraceSteps(normalizedRuntimeEvents);

  return {
    platformTrace: {
      traceId:
        normalizedRequestContext.requestId
        ?? normalizedRuntimeEvents.runId
        ?? `platform-trace-${Date.now()}`,
      route: normalizedRequestContext.route ?? null,
      method: normalizedRequestContext.method ?? null,
      actorId: normalizedRequestContext.actorId ?? null,
      workspaceId: normalizedRequestContext.workspaceId ?? null,
      service:
        normalizedRequestContext.service
        ?? normalizedRuntimeEvents.service
        ?? "nexus-runtime",
      runId: normalizedRuntimeEvents.runId ?? null,
      status:
        normalizedRuntimeEvents.status
        ?? normalizedRuntimeEvents.progressPhase
        ?? "observed",
      steps: traceSteps,
    },
    platformLogs: platformLogs.map((entry, index) => ({
      logId: entry.logId ?? `platform-log-${index + 1}`,
      level: entry.level ?? (entry.exitCode && entry.exitCode !== 0 ? "error" : "info"),
      source: entry.source ?? entry.type ?? "runtime",
      message: entry.message ?? entry.output ?? entry.command ?? "Runtime event observed",
      timestamp: entry.timestamp ?? null,
      metadata: {
        command: entry.command ?? null,
        exitCode: entry.exitCode ?? null,
      },
    })),
  };
}
