function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function cloneEntry(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildTraceRecord(platformTrace = {}) {
  const normalizedTrace = normalizeObject(platformTrace);

  return {
    traceId: normalizedTrace.traceId ?? `platform-trace-${Date.now()}`,
    route: normalizedTrace.route ?? null,
    method: normalizedTrace.method ?? null,
    actorId: normalizedTrace.actorId ?? null,
    workspaceId: normalizedTrace.workspaceId ?? null,
    service: normalizedTrace.service ?? "nexus-runtime",
    runId: normalizedTrace.runId ?? null,
    status: normalizedTrace.status ?? "observed",
    startedAt: normalizedTrace.startedAt ?? normalizedTrace.timestamp ?? new Date().toISOString(),
    completedAt: normalizedTrace.completedAt ?? null,
    durationMs: normalizedTrace.durationMs ?? null,
    steps: normalizeArray(normalizedTrace.steps).map((step, index) => ({
      stepId: step?.stepId ?? `trace-step-${index + 1}`,
      source: step?.source ?? "runtime",
      status: step?.status ?? "observed",
      timestamp: step?.timestamp ?? null,
      message: step?.message ?? null,
    })),
  };
}

function buildLogRecord(platformLog = {}, traceId, index = 0) {
  const normalizedLog = normalizeObject(platformLog);

  return {
    logId: normalizedLog.logId ?? `${traceId}:log-${index + 1}`,
    traceId,
    level: normalizedLog.level ?? "info",
    source: normalizedLog.source ?? "runtime",
    message: normalizedLog.message ?? "Runtime event observed",
    timestamp: normalizedLog.timestamp ?? new Date().toISOString(),
    metadata: normalizeObject(normalizedLog.metadata),
  };
}

function mergeSteps(existingSteps = [], incomingSteps = []) {
  const merged = [...existingSteps];
  const seen = new Set(existingSteps.map((step) => step.stepId));

  for (const step of incomingSteps) {
    if (!seen.has(step.stepId)) {
      merged.push(step);
      seen.add(step.stepId);
    }
  }

  return merged;
}

export class PlatformObservabilityTransport {
  constructor({ maxTraceRecords = 200, maxLogRecords = 1000 } = {}) {
    this.maxTraceRecords = maxTraceRecords;
    this.maxLogRecords = maxLogRecords;
    this.traceRecords = [];
    this.logRecords = [];
  }

  trimBuffers() {
    if (this.traceRecords.length > this.maxTraceRecords) {
      this.traceRecords = this.traceRecords.slice(-this.maxTraceRecords);
    }

    if (this.logRecords.length > this.maxLogRecords) {
      this.logRecords = this.logRecords.slice(-this.maxLogRecords);
    }
  }

  recordTraceEnvelope({ platformTrace = null, platformLogs = [] } = {}) {
    const traceRecord = buildTraceRecord(platformTrace);
    const traceIndex = this.traceRecords.findIndex((entry) => entry.traceId === traceRecord.traceId);
    const existingRecord = traceIndex >= 0 ? this.traceRecords[traceIndex] : null;
    const nextTraceRecord = existingRecord
      ? {
          ...existingRecord,
          ...traceRecord,
          steps: mergeSteps(existingRecord.steps, traceRecord.steps),
          completedAt: traceRecord.completedAt ?? existingRecord.completedAt ?? null,
          durationMs: traceRecord.durationMs ?? existingRecord.durationMs ?? null,
        }
      : traceRecord;

    if (traceIndex >= 0) {
      this.traceRecords[traceIndex] = nextTraceRecord;
    } else {
      this.traceRecords.push(nextTraceRecord);
    }

    const nextLogs = normalizeArray(platformLogs).map((logEntry, index) =>
      buildLogRecord(logEntry, nextTraceRecord.traceId, index),
    );
    this.logRecords.push(...nextLogs);
    this.trimBuffers();

    return {
      platformTrace: cloneEntry(nextTraceRecord),
      platformLogs: nextLogs.map((entry) => cloneEntry(entry)),
    };
  }

  startHttpRequest({ requestId, route, method, actorId = null, workspaceId = null, service = "http-server" } = {}) {
    return this.recordTraceEnvelope({
      platformTrace: {
        traceId: requestId ?? `http-request-${Date.now()}`,
        route: route ?? null,
        method: method ?? null,
        actorId,
        workspaceId,
        service,
        status: "running",
        startedAt: new Date().toISOString(),
        steps: [
          {
            stepId: "request-received",
            source: service,
            status: "running",
            timestamp: new Date().toISOString(),
            message: `${method ?? "GET"} ${route ?? "/"}`,
          },
        ],
      },
      platformLogs: [
        {
          level: "info",
          source: service,
          message: `Received ${method ?? "GET"} ${route ?? "/"}`,
          timestamp: new Date().toISOString(),
          metadata: {
            phase: "request-start",
          },
        },
      ],
    }).platformTrace;
  }

  finishHttpRequest({ traceId, route, method, statusCode = 200, durationMs = null, error = null, service = "http-server" } = {}) {
    if (!traceId) {
      return null;
    }

    return this.recordTraceEnvelope({
      platformTrace: {
        traceId,
        route: route ?? null,
        method: method ?? null,
        service,
        status: statusCode >= 500 ? "failed" : "completed",
        completedAt: new Date().toISOString(),
        durationMs,
        steps: [
          {
            stepId: "response-sent",
            source: service,
            status: statusCode >= 500 ? "failed" : "completed",
            timestamp: new Date().toISOString(),
            message: `Response ${statusCode}`,
          },
        ],
      },
      platformLogs: [
        {
          level: statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info",
          source: service,
          message: `Completed ${method ?? "GET"} ${route ?? "/"} with ${statusCode}`,
          timestamp: new Date().toISOString(),
          metadata: {
            phase: "request-end",
            statusCode,
            durationMs,
            error: error ? String(error.message ?? error) : null,
          },
        },
      ],
    }).platformTrace;
  }

  getSnapshot() {
    return {
      platformTraces: this.traceRecords.map((entry) => cloneEntry(entry)),
      platformLogs: this.logRecords.map((entry) => cloneEntry(entry)),
      summary: {
        totalTraces: this.traceRecords.length,
        totalLogs: this.logRecords.length,
        activeTraces: this.traceRecords.filter((entry) => entry.status === "running").length,
        latestTraceId: this.traceRecords.at(-1)?.traceId ?? null,
        latestLogId: this.logRecords.at(-1)?.logId ?? null,
      },
    };
  }
}

export function createPlatformObservabilityTransport(options) {
  return new PlatformObservabilityTransport(options);
}
