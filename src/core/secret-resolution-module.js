function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildMissingInputs({ externalCapabilityRegistry, sourceControlIntegration }) {
  const missingInputs = [];
  if (normalizeString(externalCapabilityRegistry?.externalCapabilityRegistryId) === null) {
    missingInputs.push("externalCapabilityRegistry");
  }
  if (normalizeString(sourceControlIntegration?.sourceControlIntegrationId) === null) {
    missingInputs.push("sourceControlIntegration");
  }
  return missingInputs;
}

function buildResolutionCandidate({ credentialReference, credentialVaultRecord, linkedAccounts }) {
  if (normalizeString(credentialReference)) {
    return {
      credentialReference: normalizeString(credentialReference),
      source: "project-context",
      vaultRecord: normalizeObject(credentialVaultRecord),
    };
  }

  const linkedAccount = normalizeArray(linkedAccounts).find((account) => normalizeString(account?.credentialReference));
  return {
    credentialReference: normalizeString(linkedAccount?.credentialReference),
    source: linkedAccount ? "linked-account" : "missing",
    vaultRecord: normalizeObject(linkedAccount?.credentialVaultRecord),
  };
}

function buildLifecycle(vaultRecord) {
  const lifecycle = normalizeObject(vaultRecord?.secretReferenceLifecycle);
  return {
    created: lifecycle.created === true,
    encrypted: lifecycle.encrypted === true,
    resolved: lifecycle.resolved === true,
    revoked: lifecycle.revoked === true,
  };
}

export function createSecretResolutionModule({
  projectId = null,
  credentialReference = null,
  credentialVaultRecord = null,
  linkedAccounts = [],
  externalCapabilityRegistry = null,
  sourceControlIntegration = null,
} = {}) {
  const registry = normalizeObject(externalCapabilityRegistry);
  const sourceControl = normalizeObject(sourceControlIntegration);
  const missingInputs = buildMissingInputs({
    externalCapabilityRegistry: registry,
    sourceControlIntegration: sourceControl,
  });
  const candidate = buildResolutionCandidate({
    credentialReference,
    credentialVaultRecord,
    linkedAccounts,
  });
  const lifecycle = buildLifecycle(candidate.vaultRecord);
  const binding = normalizeObject(sourceControl.binding);
  const providerEntry = normalizeArray(registry.providerEntries).find((entry) =>
    normalizeString(entry?.providerType) === normalizeString(binding.providerType),
  ) ?? null;
  const hasReference = normalizeString(candidate.credentialReference) !== null;
  const canResolveSecret = hasReference && lifecycle.created && lifecycle.encrypted && lifecycle.revoked !== true;

  return {
    secretResolutionState: {
      secretResolutionStateId: `secret-resolution:${normalizeString(projectId, "unknown-project")}`,
      projectId: normalizeString(projectId),
      status: missingInputs.length > 0 ? "missing-inputs" : canResolveSecret ? "ready" : "unresolved",
      missingInputs,
      resolution: {
        credentialReference: normalizeString(candidate.credentialReference),
        referenceSource: candidate.source,
        providerType: normalizeString(binding.providerType),
        verificationStatus: normalizeString(binding.verificationStatus, "unknown"),
        connectorStatus: normalizeString(binding.connectorStatus, "unknown"),
      },
      lifecycle,
      providerBinding: {
        registryEntryId: normalizeString(providerEntry?.registryEntryId),
        authModes: normalizeArray(providerEntry?.authModes),
        operationTypes: normalizeArray(providerEntry?.operationTypes),
        linkedAccountId: normalizeString(binding.linkedAccountId),
      },
      summary: {
        canResolveSecret,
        safeForConnectorUse: canResolveSecret && normalizeString(binding.verificationStatus) === "verified",
        secretValueExposed: false,
      },
    },
  };
}
