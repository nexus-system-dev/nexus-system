function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveProviderStatus({ providerConnector, providerSession, externalProviderHealthAndFailover }) {
  const lifecycleState = normalizeString(externalProviderHealthAndFailover.lifecycleState, "healthy");
  if (lifecycleState === "failover") {
    return "degraded";
  }

  return normalizeString(providerConnector.status, normalizeString(providerSession.status, "unknown"));
}

function resolveTargetSurface({ executionActionRouting, sandboxDecision, executionModeDecision }) {
  return normalizeString(
    executionActionRouting.resolvedRoute?.targetSurface,
    normalizeString(sandboxDecision.selectedSurface, normalizeString(executionModeDecision.selectedMode, "manual")),
  );
}

function resolveOperationTypes({ executionActionRouting, providerOperations }) {
  return [
    normalizeString(executionActionRouting.resolvedRoute?.requestedOperation, null),
    ...normalizeArray(providerOperations).map((operation) => normalizeString(operation?.operationType, null)),
  ].filter(Boolean);
}

export function createActionToProviderMappingResolver({
  executionActionRouting = null,
  providerAdapter = null,
  providerSession = null,
  providerConnector = null,
  providerCapabilities = null,
  providerOperations = [],
  connectorCredentialBinding = null,
  executionModeDecision = null,
  sandboxDecision = null,
  externalProviderHealthAndFailover = null,
  credentialReference = null,
} = {}) {
  const routing = normalizeObject(executionActionRouting);
  const adapter = normalizeObject(providerAdapter);
  const session = normalizeObject(providerSession);
  const connector = normalizeObject(providerConnector);
  const capabilities = normalizeObject(providerCapabilities);
  const binding = normalizeObject(connectorCredentialBinding);
  const modeDecision = normalizeObject(executionModeDecision);
  const sandbox = normalizeObject(sandboxDecision);
  const providerHealth = normalizeObject(externalProviderHealthAndFailover);
  const providerType = normalizeString(
    routing.resolvedRoute?.providerType,
    normalizeString(adapter.provider, normalizeString(session.providerType, "generic")),
  );
  const operationTypes = resolveOperationTypes({
    executionActionRouting: routing,
    providerOperations,
  });
  const providerStatus = resolveProviderStatus({
    providerConnector: connector,
    providerSession: session,
    externalProviderHealthAndFailover: providerHealth,
  });
  const blockedReasons = [
    ...(normalizeArray(routing.blockedReasons)),
    binding.summary?.safeForRuntimeUse === true ? null : "connector-binding-unsafe",
  ].filter(Boolean);

  return {
    actionToProviderMapping: {
      actionToProviderMappingId: `action-to-provider:${normalizeString(routing.executionActionRoutingId, providerType)}`,
      status: blockedReasons.length === 0 ? "ready" : "blocked",
      providerType,
      providerStatus,
      executionMode: normalizeString(
        routing.resolvedRoute?.executionMode,
        normalizeString(modeDecision.selectedMode, normalizeString(adapter.executionModes?.[0], "manual")),
      ),
      targetSurface: resolveTargetSurface({
        executionActionRouting: routing,
        sandboxDecision: sandbox,
        executionModeDecision: modeDecision,
      }),
      buildTarget: normalizeString(adapter.target, null),
      capabilities: normalizeArray(capabilities.capabilities).filter(Boolean),
      operationTypes,
      credentialReference: normalizeString(
        credentialReference,
        normalizeString(binding.credentialReference, normalizeString(session.credentialReference)),
      ),
      routeType: normalizeString(routing.routeType, "provider-runtime"),
      blockedReasons,
      summary: {
        isMapped: blockedReasons.length === 0,
        supportsRequestedOperation: operationTypes.includes(
          normalizeString(routing.resolvedRoute?.requestedOperation, null),
        ),
        usesFallbackProvider:
          normalizeString(providerHealth.failover?.target, null) !== null
          && providerHealth.failover?.requested === true,
      },
    },
  };
}
