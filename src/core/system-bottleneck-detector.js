function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function extractQueueLagSeconds(queueObservability) {
  if (typeof queueObservability.lagSeconds === "number") {
    return queueObservability.lagSeconds;
  }

  if (typeof queueObservability.queueLagSeconds === "number") {
    return queueObservability.queueLagSeconds;
  }

  if (typeof queueObservability.nextPollInSeconds === "number") {
    return queueObservability.nextPollInSeconds;
  }

  return 0;
}

function buildQueueSignals(queueObservability, platformTrace) {
  const normalizedQueue = normalizeObject(queueObservability);
  const logs = normalizeArray(platformTrace.logs);
  const queueLagSeconds = extractQueueLagSeconds(normalizedQueue);
  const retryPressure = normalizedQueue.retryPressure ?? normalizedQueue.attempt ?? normalizedQueue.attempts ?? 0;
  const deadLetterCount = normalizedQueue.deadLetterCount ?? 0;
  const queueDepth = normalizedQueue.queueDepth ?? normalizedQueue.pendingJobs ?? 0;
  const queueName = normalizedQueue.queueName ?? normalizedQueue.queueId ?? "nexus-background";
  const stuckLogs = logs.filter((entry) => {
    const message = `${entry?.message ?? ""}`.toLowerCase();
    return message.includes("queue") && (message.includes("stall") || message.includes("stuck") || message.includes("blocked"));
  });

  const signals = [];

  if (queueLagSeconds >= 30) {
    signals.push({
      type: "queue-lag",
      severity: queueLagSeconds >= 120 ? "critical" : "high",
      score: queueLagSeconds >= 120 ? 1 : 0.8,
      reason: `Queue lag reached ${queueLagSeconds}s`,
      affectedComponents: [queueName],
    });
  }

  if (retryPressure >= 3 || deadLetterCount > 0) {
    signals.push({
      type: "queue-retry-pressure",
      severity: deadLetterCount > 0 ? "critical" : "high",
      score: deadLetterCount > 0 ? 1 : 0.75,
      reason: deadLetterCount > 0
        ? `Dead-letter pressure detected (${deadLetterCount})`
        : `Retry pressure detected (${retryPressure} attempts)`,
      affectedComponents: [queueName],
    });
  }

  if (queueDepth >= 10) {
    signals.push({
      type: "queue-depth",
      severity: queueDepth >= 25 ? "high" : "medium",
      score: queueDepth >= 25 ? 0.75 : 0.5,
      reason: `Queue depth reached ${queueDepth} jobs`,
      affectedComponents: [queueName],
    });
  }

  if (stuckLogs.length > 0) {
    signals.push({
      type: "stuck-execution-lane",
      severity: "critical",
      score: 1,
      reason: stuckLogs[0].message ?? "Execution lane is stuck",
      affectedComponents: [queueName],
    });
  }

  return {
    queueName,
    queueLagSeconds,
    retryPressure,
    deadLetterCount,
    queueDepth,
    stuckJobCount: normalizedQueue.stuckJobCount ?? stuckLogs.length,
    signals,
  };
}

function buildRuntimeSignals(platformTrace, healthStatus) {
  const normalizedTrace = normalizeObject(platformTrace);
  const normalizedHealth = normalizeObject(healthStatus);
  const traceSteps = normalizeArray(normalizedTrace.steps);
  const degradedDependencies = normalizeArray(normalizedHealth.dependencyStatus).filter((dependency) =>
    ["degraded", "down", "failed", "blocked"].includes(dependency?.status),
  );
  const runtimeFailures = traceSteps.filter((step) => ["failed", "blocked"].includes(step?.status));

  const signals = [];

  if (normalizedHealth.status === "degraded") {
    signals.push({
      type: "runtime-pressure",
      severity: degradedDependencies.length >= 2 ? "critical" : "high",
      score: degradedDependencies.length >= 2 ? 1 : 0.8,
      reason: "Runtime health is degraded",
      affectedComponents: degradedDependencies.map((dependency) => dependency.name),
    });
  }

  if (normalizedHealth.isReady === false || normalizedHealth.status === "not-ready") {
    signals.push({
      type: "runtime-readiness",
      severity: "high",
      score: 0.8,
      reason: "Runtime readiness is blocked",
      affectedComponents: normalizeArray(normalizedHealth.blockers),
    });
  }

  if (runtimeFailures.length > 0) {
    signals.push({
      type: "runtime-failure-lane",
      severity: runtimeFailures.length >= 2 ? "critical" : "high",
      score: runtimeFailures.length >= 2 ? 1 : 0.7,
      reason: runtimeFailures[0].message ?? "Runtime execution lane is failing",
      affectedComponents: [...new Set(runtimeFailures.map((step) => step.source ?? "runtime"))],
    });
  }

  return {
    degradedDependencies: degradedDependencies.map((dependency) => dependency.name),
    failedLaneCount: runtimeFailures.length,
    signals,
  };
}

function buildProviderSignals(platformTrace, healthStatus) {
  const normalizedTrace = normalizeObject(platformTrace);
  const incidentAlert = normalizeObject(normalizedHealthStatus(healthStatus).incidentAlert ?? null);
  const traceSteps = normalizeArray(normalizedTrace.steps);
  const providerFailures = traceSteps.filter((step) => {
    const source = `${step?.source ?? ""}`.toLowerCase();
    return source.includes("provider") || source.includes("connector");
  }).filter((step) => ["failed", "blocked"].includes(step?.status));
  const incidentProviderComponents = normalizeArray(incidentAlert.affectedComponents).filter((component) =>
    `${component}`.toLowerCase().includes("provider") || `${component}`.toLowerCase().includes("connector"),
  );
  const signals = [];

  if (providerFailures.length > 0) {
    signals.push({
      type: "provider-failure",
      severity: providerFailures.length >= 2 ? "critical" : "high",
      score: providerFailures.length >= 2 ? 1 : 0.75,
      reason: providerFailures[0].message ?? "Provider failures detected",
      affectedComponents: [...new Set(providerFailures.map((step) => step.source ?? "provider"))],
    });
  }

  if (incidentProviderComponents.length > 0) {
    signals.push({
      type: "provider-degradation",
      severity: "high",
      score: 0.7,
      reason: "Provider degradation surfaced through active incident alerts",
      affectedComponents: incidentProviderComponents,
    });
  }

  return {
    affectedProviders: [...new Set([
      ...providerFailures.map((step) => step.source ?? "provider"),
      ...incidentProviderComponents,
    ])],
    signals,
  };
}

function normalizedHealthStatus(healthStatus) {
  return healthStatus && typeof healthStatus === "object" ? healthStatus : {};
}

function severityBand(score) {
  if (score >= 0.9) {
    return "critical";
  }

  if (score >= 0.7) {
    return "high";
  }

  if (score >= 0.4) {
    return "medium";
  }

  return "low";
}

export function createSystemBottleneckDetector({
  platformTrace = null,
  healthStatus = null,
  queueObservability = null,
} = {}) {
  const normalizedTrace = normalizeObject(platformTrace);
  const normalizedHealth = normalizedHealthStatus(healthStatus);
  const queueSignals = buildQueueSignals(queueObservability, normalizedTrace);
  const runtimeSignals = buildRuntimeSignals(normalizedTrace, normalizedHealth);
  const providerSignals = buildProviderSignals(normalizedTrace, normalizedHealth);
  const allSignals = [
    ...queueSignals.signals,
    ...runtimeSignals.signals,
    ...providerSignals.signals,
  ];
  const strongestSignal = allSignals
    .slice()
    .sort((left, right) => (right.score ?? 0) - (left.score ?? 0))[0] ?? null;
  const bottleneckScore = strongestSignal?.score ?? 0;

  return {
    systemBottleneckSummary: {
      bottleneckSummaryId: `system-bottleneck:${normalizedTrace.traceId ?? "runtime"}`,
      status: strongestSignal ? "blocked" : "clear",
      severity: severityBand(bottleneckScore),
      bottleneckScore,
      bottleneckType: strongestSignal?.type ?? "none",
      summary: strongestSignal?.reason ?? "No active system bottleneck detected",
      affectedComponents: [...new Set(allSignals.flatMap((signal) => signal.affectedComponents ?? []))],
      queueObservability: {
        queueName: queueSignals.queueName,
        queueLagSeconds: queueSignals.queueLagSeconds,
        retryPressure: queueSignals.retryPressure,
        deadLetterCount: queueSignals.deadLetterCount,
        queueDepth: queueSignals.queueDepth,
        stuckJobCount: queueSignals.stuckJobCount,
      },
      runtimePressure: {
        degradedDependencies: runtimeSignals.degradedDependencies,
        failedLaneCount: runtimeSignals.failedLaneCount,
      },
      providerFailures: {
        affectedProviders: providerSignals.affectedProviders,
        failureCount: providerSignals.signals.length,
      },
      signals: allSignals,
      traceId: normalizedTrace.traceId ?? null,
      checkedAt: new Date().toISOString(),
    },
  };
}
