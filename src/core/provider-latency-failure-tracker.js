function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function resolveObservedLatencyMs(providerResult, serviceResult, executionState) {
  return normalizeNumber(providerResult.latencyMs)
    ?? normalizeNumber(serviceResult.latencyMs)
    ?? normalizeNumber(executionState.summary?.latencyMs);
}

function resolveLatencyBudgetMs(providerResult, serviceResult, executionState) {
  return normalizeNumber(providerResult.latencyBudgetMs)
    ?? normalizeNumber(serviceResult.latencyBudgetMs)
    ?? normalizeNumber(executionState.summary?.latencyBudgetMs);
}

function resolveLatencyStatus(observedLatencyMs, latencyBudgetMs) {
  if (observedLatencyMs === null) {
    return "unmeasured";
  }

  if (latencyBudgetMs === null) {
    return "observed";
  }

  if (observedLatencyMs > latencyBudgetMs) {
    return "above-budget";
  }

  return "within-budget";
}

function buildFailureSignals({
  aiGenerationObservability,
  aiDesignProviderResult,
  aiDesignServiceResult,
  aiDesignExecutionState,
  externalProviderHealthAndFailover,
}) {
  const observability = normalizeObject(aiGenerationObservability);
  const providerResult = normalizeObject(aiDesignProviderResult);
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const executionState = normalizeObject(aiDesignExecutionState);
  const providerHealth = normalizeObject(externalProviderHealthAndFailover);
  const categories = [];
  const reasons = [];

  const blockingChecks = normalizeArray(observability.contractChecks)
    .filter((check) => ["missing", "blocked", "invalid"].includes(check?.status))
    .map((check) => ({
      category: "contract-blocker",
      reason: normalizeString(check.reason, "Canonical contract check is blocked."),
    }));

  if (providerResult.status && providerResult.status !== "ready") {
    categories.push("provider-status");
    reasons.push(`Provider result status is ${providerResult.status}.`);
  }

  if (serviceResult.status && serviceResult.status !== "ready") {
    categories.push("service-status");
    reasons.push(`AI design service status is ${serviceResult.status}.`);
  }

  if (executionState.status && executionState.status !== "generated") {
    categories.push("execution-state");
    reasons.push(`AI design execution state is ${executionState.status}.`);
  }

  if (providerHealth.lifecycleState === "degraded" || providerHealth.lifecycleState === "failover") {
    categories.push("provider-health");
    reasons.push(`Provider health lifecycle is ${providerHealth.lifecycleState}.`);
  }

  if (providerHealth.providerHealth === "degraded" || providerHealth.providerHealth === "outage") {
    categories.push("provider-outage");
    reasons.push(`Provider health is ${providerHealth.providerHealth}.`);
  }

  for (const blockingCheck of blockingChecks) {
    categories.push(blockingCheck.category);
    reasons.push(blockingCheck.reason);
  }

  return {
    failureCount: categories.length,
    categories: [...new Set(categories)],
    reasons: reasons.filter(Boolean),
  };
}

export function createProviderLatencyFailureTracker({
  aiGenerationObservability = null,
  aiDesignProviderResult = null,
  aiDesignServiceResult = null,
  aiDesignExecutionState = null,
  externalProviderHealthAndFailover = null,
} = {}) {
  const observability = normalizeObject(aiGenerationObservability);
  const providerResult = normalizeObject(aiDesignProviderResult);
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const executionState = normalizeObject(aiDesignExecutionState);
  const providerHealth = normalizeObject(externalProviderHealthAndFailover);
  const observedLatencyMs = resolveObservedLatencyMs(providerResult, serviceResult, executionState);
  const latencyBudgetMs = resolveLatencyBudgetMs(providerResult, serviceResult, executionState);
  const latencyStatus = resolveLatencyStatus(observedLatencyMs, latencyBudgetMs);
  const failureSignals = buildFailureSignals({
    aiGenerationObservability: observability,
    aiDesignProviderResult: providerResult,
    aiDesignServiceResult: serviceResult,
    aiDesignExecutionState: executionState,
    externalProviderHealthAndFailover: providerHealth,
  });
  const providerId = normalizeString(providerResult.providerId, observability.providerId ?? "unknown-provider");
  const providerMode = normalizeString(providerResult.mode, "unknown");
  const lifecycleState = normalizeString(providerHealth.lifecycleState, "unknown");
  const providerHealthState = normalizeString(providerHealth.providerHealth, "unknown");
  const circuitState = normalizeString(providerHealth.circuitState, "unknown");

  return {
    providerLatencyFailureTracker: {
      trackerId: `provider-latency-failure:${providerId}:${normalizeString(observability.observabilityId, "unknown")}`,
      observabilityId: normalizeString(observability.observabilityId),
      providerId,
      providerMode,
      status: failureSignals.failureCount > 0 ? "needs-attention" : "healthy",
      latency: {
        observedLatencyMs,
        latencyBudgetMs,
        latencyStatus,
        source: observedLatencyMs === null ? "unmeasured" : "provider-observed",
      },
      failure: {
        failureCount: failureSignals.failureCount,
        failureCategories: failureSignals.categories,
        latestReason: failureSignals.reasons[0] ?? null,
        reasons: failureSignals.reasons,
      },
      providerHealth: {
        lifecycleState,
        providerHealth: providerHealthState,
        circuitState,
        activeTarget: normalizeString(providerHealth.providerRoute?.activeTarget),
      },
      summary: {
        requiresAttention: failureSignals.failureCount > 0,
        latencyStatus,
        failureCount: failureSignals.failureCount,
        validationStatus: normalizeString(observability.summary?.validationStatus, "unknown"),
        reviewStatus: normalizeString(observability.summary?.reviewStatus, "unknown"),
        applyStatus: normalizeString(observability.summary?.applyStatus, "unknown"),
      },
    },
  };
}
