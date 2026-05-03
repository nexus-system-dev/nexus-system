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

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(systemCapabilityRegistry) {
  const missingInputs = [];
  if (normalizeString(systemCapabilityRegistry?.systemCapabilityRegistryId) === null) {
    missingInputs.push("systemCapabilityRegistry");
  }
  return missingInputs;
}

function buildOperationalGuarantees({
  providerSession,
  providerOperations,
  verificationResult,
  providerConnector,
}) {
  const operations = normalizeArray(providerOperations);
  return {
    connectorStatus: normalizeString(providerConnector?.status, normalizeString(providerSession?.status, "unknown")),
    verificationStatus: normalizeString(verificationResult?.status, "unverified"),
    supportsPolling: operations.some((operation) => operation.operationType === "poll"),
    supportsRevocation: operations.some((operation) => operation.operationType === "revoke"),
    requiresApprovalForMutations: operations.some((operation) => operation.requiresApproval === true),
    guaranteedOperations: operations.filter((operation) => operation.supported !== false).map((operation) => operation.operationType),
  };
}

function buildAccountBindings(linkedAccounts) {
  return normalizeArray(linkedAccounts).map((linkedAccount) => {
    const accountRecord = normalizeObject(linkedAccount?.accountRecord);
    const providerSession = normalizeObject(linkedAccount?.providerSession);

    return {
      accountId: normalizeString(accountRecord.accountId),
      providerType: normalizeString(providerSession.providerType, normalizeString(accountRecord.metadata?.provider, accountRecord.accountType)),
      connectionMode: normalizeString(providerSession.authMode, normalizeString(accountRecord.connectionMode, "manual")),
      scopes: unique(providerSession.scopes),
      credentialReference: normalizeString(linkedAccount?.credentialReference, accountRecord.credentialReference ?? null),
      verificationStatus: normalizeString(linkedAccount?.verificationResult?.status, "unknown"),
    };
  }).filter((binding) => binding.accountId && binding.providerType);
}

function buildCapabilitySource({
  providerSession,
  providerConnectorSchema,
  providerCapabilities,
  providerOperations,
}) {
  const session = normalizeObject(providerSession);
  const schema = normalizeObject(providerConnectorSchema);
  const capabilities = normalizeObject(providerCapabilities);

  return {
    providerType: normalizeString(session.providerType, normalizeString(schema.providerType, capabilities.providerType ?? "generic")),
    authModes: unique([...normalizeArray(schema.authenticationModes), ...normalizeArray(session.authenticationModes)]),
    scopes: unique(session.scopes),
    capabilities: unique([...normalizeArray(schema.capabilities), ...normalizeArray(capabilities.capabilities)]),
    operationTypes: unique([
      ...normalizeArray(schema.operationTypes),
      ...normalizeArray(providerOperations).map((operation) => operation.operationType),
    ]),
  };
}

export function defineExternalCapabilityRegistrySchema({
  systemCapabilityRegistry = null,
  providerSession = null,
  providerConnectorSchema = null,
  providerCapabilities = null,
  providerOperations = [],
  providerConnector = null,
  verificationResult = null,
  linkedAccounts = [],
} = {}) {
  const systemRegistry = normalizeObject(systemCapabilityRegistry);
  const missingInputs = buildMissingInputs(systemRegistry);
  const capabilitySource = buildCapabilitySource({
    providerSession,
    providerConnectorSchema,
    providerCapabilities,
    providerOperations,
  });
  const accountBindings = buildAccountBindings(linkedAccounts);
  const providerType = capabilitySource.providerType;

  const providerEntries = providerType
    ? [
        {
          registryEntryId: `external-capability:${slugify(providerType)}`,
          providerType,
          authModes: capabilitySource.authModes,
          scopes: capabilitySource.scopes,
          capabilities: capabilitySource.capabilities,
          operationTypes: capabilitySource.operationTypes,
          linkedAccounts: accountBindings.filter((binding) => binding.providerType === providerType),
          executionModes: normalizeArray(systemRegistry.executionModes),
          supportedWorkflows: normalizeArray(systemRegistry.supportedWorkflows),
          operationalGuarantees: buildOperationalGuarantees({
            providerSession,
            providerOperations,
            verificationResult,
            providerConnector,
          }),
        },
      ]
    : [];

  return {
    externalCapabilityRegistry: {
      externalCapabilityRegistryId: `external-capability-registry:${slugify(systemRegistry.systemCapabilityRegistryId ?? providerType)}`,
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      providerEntries,
      summary: {
        providerCount: providerEntries.length,
        linkedAccountCount: accountBindings.length,
        supportedWorkflowCount: normalizeArray(systemRegistry.supportedWorkflows).length,
        verifiedProviderCount: providerEntries.filter((entry) => entry.operationalGuarantees.verificationStatus === "verified").length,
      },
    },
  };
}
