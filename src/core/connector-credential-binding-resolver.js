function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildMissingInputs({ externalCapabilityRegistry, secretResolutionState }) {
  const missingInputs = [];
  if (normalizeString(externalCapabilityRegistry?.externalCapabilityRegistryId) === null) {
    missingInputs.push("externalCapabilityRegistry");
  }
  if (normalizeString(secretResolutionState?.secretResolutionStateId) === null) {
    missingInputs.push("secretResolutionState");
  }
  return missingInputs;
}

export function createConnectorCredentialBindingResolver({
  projectId = null,
  externalCapabilityRegistry = null,
  secretResolutionState = null,
  providerConnector = null,
  linkedAccounts = [],
} = {}) {
  const registry = normalizeObject(externalCapabilityRegistry);
  const secretState = normalizeObject(secretResolutionState);
  const connector = normalizeObject(providerConnector);
  const missingInputs = buildMissingInputs({
    externalCapabilityRegistry: registry,
    secretResolutionState: secretState,
  });

  const resolution = normalizeObject(secretState.resolution);
  const binding = normalizeObject(secretState.providerBinding);
  const providerType = normalizeString(connector.providerType, normalizeString(resolution.providerType, null));
  const providerEntry = normalizeArray(registry.providerEntries).find((entry) => normalizeString(entry?.providerType) === providerType) ?? null;
  const linkedAccount = normalizeArray(linkedAccounts).find((account) =>
    normalizeString(account?.accountRecord?.accountId) === normalizeString(binding.linkedAccountId),
  ) ?? normalizeArray(linkedAccounts).find((account) =>
    normalizeString(account?.credentialReference) === normalizeString(resolution.credentialReference),
  ) ?? null;

  const ready = missingInputs.length === 0
    && secretState.summary?.safeForConnectorUse === true
    && normalizeString(resolution.credentialReference) !== null
    && providerType !== null;

  return {
    connectorCredentialBinding: {
      connectorCredentialBindingId: `connector-credential-binding:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: missingInputs.length > 0 ? "missing-inputs" : ready ? "ready" : "unresolved",
      missingInputs,
      binding: {
        providerType,
        registryEntryId: normalizeString(providerEntry?.registryEntryId, normalizeString(binding.registryEntryId)),
        connectorStatus: normalizeString(connector.status, normalizeString(resolution.connectorStatus, "unknown")),
        credentialReference: normalizeString(resolution.credentialReference),
        linkedAccountId: normalizeString(linkedAccount?.accountRecord?.accountId, normalizeString(binding.linkedAccountId)),
        authModes: normalizeArray(providerEntry?.authModes).length > 0
          ? normalizeArray(providerEntry?.authModes)
          : normalizeArray(binding.authModes),
        operationTypes: normalizeArray(connector.operations).map((operation) => operation.operationType ?? operation).filter(Boolean),
      },
      summary: {
        safeForRuntimeUse: ready,
        verifiedBinding: normalizeString(resolution.verificationStatus) === "verified",
        secretValueExposed: false,
      },
    },
  };
}
