function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveLifecycleState({ degradationState, circuitBreakerDecision, continuityPlan }) {
  const health = normalizeString(degradationState.health, "unknown");
  const decision = normalizeString(circuitBreakerDecision.decision, "allow");
  const failoverEnabled = continuityPlan.failover?.enabled === true;

  if ((decision === "fail-fast" || health === "outage") && failoverEnabled) {
    return "failover";
  }

  if (decision === "allow-retry" || health === "degraded") {
    return "degraded";
  }

  if (decision === "fail-fast") {
    return "recovery";
  }

  return "healthy";
}

function resolveIntegrationStatus({ externalCapabilityRegistry, connectorCredentialBinding }) {
  const providerCount = Number(externalCapabilityRegistry.summary?.providerCount ?? 0);
  const safeForRuntimeUse = connectorCredentialBinding.summary?.safeForRuntimeUse === true;

  if (!safeForRuntimeUse) {
    return "blocked";
  }

  if (providerCount <= 0) {
    return "partial";
  }

  return "connected";
}

function resolveFailoverTarget({ lifecycleState, continuityPlan, providerType }) {
  if (lifecycleState === "failover") {
    return normalizeString(continuityPlan.failover?.target, `${providerType}-fallback`);
  }

  return `${providerType}-primary`;
}

function buildRoute({ lifecycleState, continuityPlan, providerType }) {
  if (lifecycleState === "failover") {
    const route = Array.isArray(continuityPlan.failover?.route) ? continuityPlan.failover.route : [];
    return route.length > 0 ? route : ["freeze-provider-route", "promote-standby", "validate-provider-health"];
  }

  if (lifecycleState === "degraded") {
    return [
      "limit-provider-operations",
      "preserve-last-known-good-state",
      "monitor-recovery-probe",
    ];
  }

  return [`use-${providerType}-primary-route`];
}

export function createExternalProviderHealthFailoverOrchestrator({
  externalCapabilityRegistry = null,
  connectorCredentialBinding = null,
  providerDegradationState = null,
  circuitBreakerDecision = null,
  providerRecoveryProbe = null,
  continuityPlan = null,
} = {}) {
  const normalizedRegistry = normalizeObject(externalCapabilityRegistry);
  const normalizedBinding = normalizeObject(connectorCredentialBinding);
  const normalizedDegradationState = normalizeObject(providerDegradationState);
  const normalizedCircuitBreakerDecision = normalizeObject(circuitBreakerDecision);
  const normalizedProviderRecoveryProbe = normalizeObject(providerRecoveryProbe);
  const normalizedContinuityPlan = normalizeObject(continuityPlan);
  const providerType = normalizeString(normalizedDegradationState.providerType, "generic");
  const lifecycleState = resolveLifecycleState({
    degradationState: normalizedDegradationState,
    circuitBreakerDecision: normalizedCircuitBreakerDecision,
    continuityPlan: normalizedContinuityPlan,
  });
  const integrationStatus = resolveIntegrationStatus({
    externalCapabilityRegistry: normalizedRegistry,
    connectorCredentialBinding: normalizedBinding,
  });
  const failoverTarget = resolveFailoverTarget({
    lifecycleState,
    continuityPlan: normalizedContinuityPlan,
    providerType,
  });
  const route = buildRoute({
    lifecycleState,
    continuityPlan: normalizedContinuityPlan,
    providerType,
  });

  return {
    externalProviderHealthAndFailover: {
      externalProviderHealthAndFailoverId: `provider-health-failover:${providerType}`,
      providerType,
      lifecycleState,
      integrationStatus,
      circuitState: normalizeString(normalizedCircuitBreakerDecision.circuitState, "unknown"),
      providerHealth: normalizeString(normalizedDegradationState.health, "unknown"),
      providerRoute: {
        activeTarget: failoverTarget,
        route,
      },
      failover: {
        enabled: normalizedContinuityPlan.failover?.enabled === true,
        target: failoverTarget,
        requested: lifecycleState === "failover",
        integrationStatus,
      },
      recovery: {
        probeStatus: normalizeString(normalizedProviderRecoveryProbe.status, "unknown"),
        reopenDecision: normalizeString(normalizedProviderRecoveryProbe.reopenDecision, "unknown"),
        nextRunInMs: Number(normalizedProviderRecoveryProbe.workerJob?.nextRunInMs ?? 0),
      },
      summary: {
        canFailover:
          integrationStatus !== "blocked"
          && normalizedContinuityPlan.summary?.canFailover === true,
        requiresFallbackRoute:
          lifecycleState === "failover"
          || normalizeString(normalizedCircuitBreakerDecision.decision, "allow") === "fail-fast",
        canRecoverInPlace:
          normalizeString(normalizedProviderRecoveryProbe.reopenDecision, "unknown") === "controlled-reopen"
          || lifecycleState === "healthy",
      },
    },
  };
}
