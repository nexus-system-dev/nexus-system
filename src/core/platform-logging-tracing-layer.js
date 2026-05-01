function normalizeRuntimeEvents(runtimeEvents) {
  return runtimeEvents && typeof runtimeEvents === "object" ? runtimeEvents : {};
}

function normalizeRequestContext(requestContext) {
  return requestContext && typeof requestContext === "object" ? requestContext : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
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
    stepId: normalizeString(entry.stepId, normalizeString(entry.id, `trace-step-${index + 1}`)),
    source: normalizeString(entry.source, normalizeString(entry.type, "runtime")),
    status: normalizeString(entry.status, "observed"),
    timestamp: normalizeString(entry.timestamp, null),
    message: normalizeString(entry.message, null),
  }));
}

export function createPlatformLoggingAndTracingLayer({
  runtimeEvents = null,
  requestContext = null,
  observabilityTransport = null,
} = {}) {
  const normalizedRuntimeEvents = normalizeRuntimeEvents(runtimeEvents);
  const normalizedRequestContext = normalizeRequestContext(requestContext);
  const platformLogs = normalizeLogEntries(normalizedRuntimeEvents);
  const traceSteps = buildTraceSteps(normalizedRuntimeEvents);

  const payload = {
    platformTrace: {
      traceId:
        normalizeString(normalizedRequestContext.requestId, null)
        ?? normalizeString(normalizedRuntimeEvents.runId, null)
        ?? `platform-trace-${Date.now()}`,
      route: normalizeString(normalizedRequestContext.route, null),
      method: normalizeString(normalizedRequestContext.method, null),
      actorId: normalizeString(normalizedRequestContext.actorId, null),
      workspaceId: normalizeString(normalizedRequestContext.workspaceId, null),
      service:
        normalizeString(normalizedRequestContext.service, null)
        ?? normalizeString(normalizedRuntimeEvents.service, null)
        ?? "nexus-runtime",
      runId: normalizeString(normalizedRuntimeEvents.runId, null),
      status:
        normalizeString(normalizedRuntimeEvents.status, null)
        ?? normalizeString(normalizedRuntimeEvents.progressPhase, null)
        ?? "observed",
      steps: traceSteps,
    },
    platformLogs: platformLogs.map((entry, index) => ({
      logId: normalizeString(entry.logId, `platform-log-${index + 1}`),
      level: normalizeString(entry.level, entry.exitCode && entry.exitCode !== 0 ? "error" : "info"),
      source: normalizeString(entry.source, normalizeString(entry.type, "runtime")),
      message: normalizeString(entry.message, normalizeString(entry.output, normalizeString(entry.command, "Runtime event observed"))),
      timestamp: normalizeString(entry.timestamp, null),
      metadata: {
        command: normalizeString(entry.command, null),
        exitCode: entry.exitCode ?? null,
      },
    })),
  };

  if (observabilityTransport && typeof observabilityTransport.recordTraceEnvelope === "function") {
    observabilityTransport.recordTraceEnvelope(payload);
  }

  return payload;
}
