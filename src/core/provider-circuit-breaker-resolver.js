function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function matchesProviderDependency(providerType, dependency) {
  const name = String(dependency?.name ?? dependency?.dependencyId ?? "").toLowerCase();
  const normalizedProviderType = String(providerType ?? "generic").toLowerCase();

  return (
    name.includes(normalizedProviderType)
    || name.includes("provider")
    || name.includes("connector")
  );
}

function collectProviderDependencySignals(providerType, runtimeHealthSignals) {
  const dependencies = normalizeArray(runtimeHealthSignals.dependencies);

  return dependencies.filter((dependency) => matchesProviderDependency(providerType, dependency));
}

function resolveCircuitState({ degradationState, dependencySignals, runtimeHealthSignals }) {
  const health = degradationState.health ?? "unknown";
  const consecutiveFailures = degradationState.consecutiveFailures ?? 0;
  const incidentActive = degradationState.summary?.hasIncidentSignal === true;
  const providerDown = dependencySignals.some((dependency) =>
    ["down", "failed", "blocked"].includes(dependency?.status),
  );
  const providerDegraded = dependencySignals.some((dependency) =>
    ["degraded", "down", "failed", "blocked"].includes(dependency?.status),
  );
  const runtimeDegraded = runtimeHealthSignals.status === "degraded" || runtimeHealthSignals.isHealthy === false;

  if (health === "outage" || providerDown || (incidentActive && consecutiveFailures >= 3)) {
    return "open";
  }

  if (health === "degraded" || providerDegraded || runtimeDegraded || consecutiveFailures >= 2) {
    return "half-open";
  }

  return "closed";
}

function resolveDecision(circuitState) {
  if (circuitState === "open") {
    return "fail-fast";
  }

  if (circuitState === "half-open") {
    return "allow-retry";
  }

  return "allow";
}

function resolveReason({ circuitState, degradationState, dependencySignals, runtimeHealthSignals }) {
  if (circuitState === "open") {
    if (degradationState.health === "outage") {
      return "Provider is in outage state and should fail fast until cooldown expires";
    }

    if (dependencySignals.some((dependency) => ["down", "failed", "blocked"].includes(dependency?.status))) {
      return "Provider dependency is down, failed or blocked and the circuit must stay open";
    }

    return "Repeated failures with active incident signal require opening the circuit";
  }

  if (circuitState === "half-open") {
    if (degradationState.health === "degraded") {
      return "Provider is degraded, so retries should be controlled instead of fully blocking execution";
    }

    if (runtimeHealthSignals.status === "degraded" || runtimeHealthSignals.isHealthy === false) {
      return "Runtime health is degraded, so provider retries should stay limited";
    }

    return "Failure pressure is elevated, so only limited retries should be allowed";
  }

  return "Provider is healthy enough to keep the circuit closed";
}

export function createProviderCircuitBreakerResolver({
  providerDegradationState = null,
  runtimeHealthSignals = null,
} = {}) {
  const normalizedDegradationState = normalizeObject(providerDegradationState);
  const normalizedRuntimeHealthSignals = normalizeObject(runtimeHealthSignals);
  const providerType = normalizedDegradationState.providerType ?? "generic";
  const dependencySignals = collectProviderDependencySignals(providerType, normalizedRuntimeHealthSignals);
  const circuitState = resolveCircuitState({
    degradationState: normalizedDegradationState,
    dependencySignals,
    runtimeHealthSignals: normalizedRuntimeHealthSignals,
  });
  const decision = resolveDecision(circuitState);
  const cooldownWindowMs = normalizedDegradationState.cooldownWindowMs ?? 0;
  const failFast = decision === "fail-fast";
  const allowRetry = decision === "allow-retry";

  return {
    circuitBreakerDecision: {
      circuitBreakerDecisionId: `provider-circuit-breaker:${providerType}`,
      providerType,
      circuitState,
      decision,
      reason: resolveReason({
        circuitState,
        degradationState: normalizedDegradationState,
        dependencySignals,
        runtimeHealthSignals: normalizedRuntimeHealthSignals,
      }),
      cooldownWindowMs,
      retryAfterMs: failFast ? cooldownWindowMs : allowRetry ? Math.max(cooldownWindowMs, 15000) : 0,
      failureThreshold: 2,
      consecutiveFailures: normalizedDegradationState.consecutiveFailures ?? 0,
      dependencySignals: dependencySignals.map((dependency) => ({
        name: dependency?.name ?? dependency?.dependencyId ?? "unknown-dependency",
        status: dependency?.status ?? "unknown",
        readiness: dependency?.readiness ?? "unknown",
        critical: dependency?.critical === true,
      })),
      summary: {
        failFast,
        shouldTrip: circuitState !== "closed",
        allowsRetry: allowRetry,
        requiresCooldown: failFast && cooldownWindowMs > 0,
      },
    },
  };
}
