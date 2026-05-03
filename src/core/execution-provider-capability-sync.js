function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values) {
  return [...new Set(normalizeArray(values).filter(Boolean))];
}

export function createExecutionProviderCapabilitySync({
  providerCapabilities = null,
  providerConnector = null,
  actionToProviderMapping = null,
  localCodingAgentAdapter = null,
  ideAgentExecutorContract = null,
} = {}) {
  const capabilities = normalizeObject(providerCapabilities);
  const connector = normalizeObject(providerConnector);
  const mapping = normalizeObject(actionToProviderMapping);
  const localAdapter = normalizeObject(localCodingAgentAdapter);
  const ideContract = normalizeObject(ideAgentExecutorContract);
  const providerType = normalizeString(
    mapping.providerType,
    normalizeString(connector.providerType, normalizeString(capabilities.providerType, "generic")),
  );
  const capabilityList = unique([
    ...normalizeArray(capabilities.capabilities),
    ...(localAdapter.capabilities?.supportsCommandExecution === true ? ["local-command-execution"] : []),
    ...(ideContract.capabilities?.supportsRemoteAppleTooling === true ? ["remote-apple-tooling"] : []),
  ]);
  const operationList = unique([
    ...normalizeArray(capabilities.operationTypes),
    ...normalizeArray(mapping.operationTypes),
    ...normalizeArray(connector.operations).map((operation) => normalizeString(operation?.operationType, null)),
  ]);
  const executionSurfaces = unique([
    normalizeString(mapping.targetSurface, null),
    normalizeString(localAdapter.adapterMode, null),
    normalizeString(ideContract.selectedMode, null),
  ]);
  const blockedReasons = [
    mapping.summary?.isMapped === true ? null : "action-provider-mapping-unready",
    localAdapter.status === "blocked" && mapping.targetSurface === "local-terminal" ? "local-coding-adapter-blocked" : null,
    capabilityList.length > 0 ? null : "provider-capabilities-missing",
    operationList.length > 0 ? null : "provider-operations-missing",
  ].filter(Boolean);

  return {
    executionProviderCapabilitySync: {
      executionProviderCapabilitySyncId: `execution-provider-capability-sync:${providerType}`,
      providerType,
      status: blockedReasons.length === 0 ? "ready" : "blocked",
      synchronizedCapabilities: capabilityList,
      synchronizedOperations: operationList,
      executionSurfaces,
      adapterStates: {
        localCodingAgentAdapterStatus: normalizeString(localAdapter.status, "missing"),
        ideAgentExecutorStatus: normalizeString(ideContract.status, "missing"),
        providerConnectorStatus: normalizeString(connector.status, "unknown"),
      },
      blockedReasons,
      summary: {
        isSynchronized: blockedReasons.length === 0,
        supportsRequestedOperation: operationList.includes(normalizeString(mapping.operationTypes?.[0], null)),
        hasLocalExecutionPath: executionSurfaces.includes("local-terminal"),
      },
    },
  };
}
