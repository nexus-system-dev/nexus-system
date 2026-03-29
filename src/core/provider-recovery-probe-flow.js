function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveProbeStatus(circuitBreakerDecision) {
  const circuitState = circuitBreakerDecision.circuitState ?? "closed";

  if (circuitState === "open") {
    return "scheduled";
  }

  if (circuitState === "half-open") {
    return "active";
  }

  return "not-needed";
}

function resolveProbeAction(circuitBreakerDecision) {
  const circuitState = circuitBreakerDecision.circuitState ?? "closed";

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
  const supportsPolling = normalizeArray(providerSession.operationTypes).includes("poll");
  const scheduledInMs = circuitBreakerDecision.circuitState === "open"
    ? Math.max(cooldownWindowMs, retryAfterMs, 30000)
    : circuitBreakerDecision.circuitState === "half-open"
      ? Math.max(retryAfterMs, 15000)
      : 0;

  return {
    trigger: circuitBreakerDecision.circuitState === "open" ? "worker-scheduled" : "inline-controlled",
    scheduledInMs,
    pollOperation: supportsPolling ? "poll" : "status-check",
    mode: supportsPolling ? "status-poll" : "lightweight-health-check",
  };
}

function resolveReopenDecision(circuitBreakerDecision) {
  if (circuitBreakerDecision.circuitState === "half-open") {
    return "controlled-reopen";
  }

  if (circuitBreakerDecision.circuitState === "open") {
    return "hold-closed";
  }

  return "no-reopen-needed";
}

function buildWorkerJob({ providerSession, schedule }) {
  return {
    jobType: "provider-recovery-probe",
    schedule: schedule.trigger === "worker-scheduled" ? "delayed" : "on-demand",
    payload: {
      providerType: providerSession.providerType ?? "generic",
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
      providerRecoveryProbeId: `provider-recovery-probe:${normalizedProviderSession.providerType ?? "generic"}`,
      providerType: normalizedProviderSession.providerType ?? "generic",
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
