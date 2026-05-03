function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createSourceControlIntegrationBinder({
  projectId = null,
  externalCapabilityRegistry = null,
  gitSnapshot = null,
  linkedAccounts = [],
} = {}) {
  const registry = normalizeObject(externalCapabilityRegistry);
  const snapshot = normalizeObject(gitSnapshot);
  const repo = normalizeObject(snapshot.repo);
  const provider = normalizeString(snapshot.provider, "git");
  const providerEntry = normalizeArray(registry.providerEntries).find((entry) => entry?.providerType === provider)
    ?? normalizeArray(registry.providerEntries).find((entry) => normalizeArray(entry?.capabilities).includes("deploy"))
    ?? null;
  const linkedAccount = normalizeArray(linkedAccounts).find((entry) =>
    normalizeString(entry?.providerSession?.providerType, normalizeString(entry?.accountRecord?.metadata?.provider))
      === normalizeString(providerEntry?.providerType, provider),
  );
  const hasRegistry = normalizeString(registry.externalCapabilityRegistryId) !== null;
  const hasRepository = normalizeString(repo.fullName) !== null;
  const missingInputs = [
    !hasRegistry ? "externalCapabilityRegistry" : null,
    !hasRepository ? "gitSnapshot" : null,
  ].filter(Boolean);

  return {
    sourceControlIntegration: {
      sourceControlIntegrationId: `source-control-integration:${slugify(projectId ?? repo.fullName ?? provider)}`,
      projectId: normalizeString(projectId),
      status: missingInputs.length === 0 ? "ready" : "missing-inputs",
      missingInputs,
      repository: {
        provider,
        fullName: normalizeString(repo.fullName),
        defaultBranch: normalizeString(repo.defaultBranch, "main"),
        branchCount: normalizeArray(snapshot.branches).length,
        commitCount: normalizeArray(snapshot.commits).length,
        pullRequestCount: normalizeArray(snapshot.pullRequests).length,
      },
      binding: {
        providerType: normalizeString(providerEntry?.providerType, provider),
        registryEntryId: normalizeString(providerEntry?.registryEntryId),
        connectorStatus: normalizeString(providerEntry?.operationalGuarantees?.connectorStatus, "unknown"),
        verificationStatus: normalizeString(linkedAccount?.verificationResult?.status, normalizeString(providerEntry?.operationalGuarantees?.verificationStatus, "unknown")),
        linkedAccountId: normalizeString(linkedAccount?.accountRecord?.accountId),
        credentialReference: normalizeString(linkedAccount?.credentialReference),
        authModes: normalizeArray(providerEntry?.authModes),
        operationTypes: normalizeArray(providerEntry?.operationTypes),
      },
      importContinuation: {
        canContinueFromRepository: missingInputs.length === 0,
        nextCapabilities: missingInputs.length === 0
          ? ["secret-resolution", "connector-credential-binding", "provider-health-orchestration"]
          : [],
      },
      summary: {
        repositoryConnected: hasRepository,
        registryBound: hasRegistry && normalizeString(providerEntry?.registryEntryId) !== null,
        hasVerifiedLinkedAccount: normalizeString(linkedAccount?.verificationResult?.status) === "verified",
      },
    },
  };
}
