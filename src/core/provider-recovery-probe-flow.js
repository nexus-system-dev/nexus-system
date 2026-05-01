function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function resolveProbeStatus(circuitBreakerDecision) {
  const circuitState = normalizeString(circuitBreakerDecision.circuitState, "closed");

  if (circuitState === "open") {
    return "scheduled";
  }

  if (circuitState === "half-open") {
    return "active";
  }

  return "not-needed";
}

function resolveProbeAction(circuitBreakerDecision) {
  const circuitState = normalizeString(circuitBreakerDecision.circuitState, "closed");

  if (circuitState === "open") {
    return "schedule-probe";
  }

  if (circuitState === "half-open") {
    return "attempt-reopen";
  }

  return "keep-open";
}

function resolveSchedule({ circuitBreakerDecision, providerSession }) {
  const cooldownWindowMs = circuitBreakerDecision.cooldownWindowMs ?? 0;
  const retryAfterMs = circuitBreakerDecision.retryAfterMs ?? 0;
  const supportsPolling = normalizeArray(providerSession.operationTypes)
    .map((operationType) => normalizeString(operationType, null))
    .filter(Boolean)
    .includes("poll");
  const circuitState = normalizeString(circuitBreakerDecision.circuitState, "closed");
  const scheduledInMs = circuitState === "open"
    ? Math.max(cooldownWindowMs, retryAfterMs, 30000)
    : circuitState === "half-open"
      ? Math.max(retryAfterMs, 15000)
      : 0;

  return {
    trigger: circuitState === "open" ? "worker-scheduled" : "inline-controlled",
    scheduledInMs,
    pollOperation: supportsPolling ? "poll" : "status-check",
    mode: supportsPolling ? "status-poll" : "lightweight-health-check",
  };
}

function resolveReopenDecision(circuitBreakerDecision) {
  const circuitState = normalizeString(circuitBreakerDecision.circuitState, "closed");

  if (circuitState === "half-open") {
    return "controlled-reopen";
  }

  if (circuitState === "open") {
    return "hold-closed";
  }

  return "no-reopen-needed";
}

function buildWorkerJob({ providerSession, schedule }) {
  return {
    jobType: "provider-recovery-probe",
    schedule: schedule.trigger === "worker-scheduled" ? "delayed" : "on-demand",
    payload: {
      providerType: normalizeString(providerSession.providerType, "generic"),
      probeMode: schedule.mode,
      pollOperation: schedule.pollOperation,
    },
    nextRunInMs: schedule.scheduledInMs,
  };
}

export function createProviderRecoveryProbeFlow({
  circuitBreakerDecision = null,
  providerSession = null,
} = {}) {
  const normalizedCircuitBreakerDecision = normalizeObject(circuitBreakerDecision);
  const normalizedProviderSession = normalizeObject(providerSession);
  const probeStatus = resolveProbeStatus(normalizedCircuitBreakerDecision);
  const probeAction = resolveProbeAction(normalizedCircuitBreakerDecision);
  const schedule = resolveSchedule({
    circuitBreakerDecision: normalizedCircuitBreakerDecision,
    providerSession: normalizedProviderSession,
  });
  const reopenDecision = resolveReopenDecision(normalizedCircuitBreakerDecision);

  return {
    providerRecoveryProbe: {
      providerRecoveryProbeId: `provider-recovery-probe:${normalizeString(normalizedProviderSession.providerType, "generic")}`,
      providerType: normalizeString(normalizedProviderSession.providerType, "generic"),
      status: probeStatus,
      probeAction,
      reopenDecision,
      schedule,
      workerJob: buildWorkerJob({
        providerSession: normalizedProviderSession,
        schedule,
      }),
      summary: {
        canProbe: probeStatus !== "not-needed",
        requiresWorker: schedule.trigger === "worker-scheduled",
        canReopen: reopenDecision === "controlled-reopen",
      },
    },
  };
}
