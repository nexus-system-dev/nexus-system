function buildAccountId(accountType, accountMetadata) {
  const provider = accountMetadata?.provider ?? "unknown-provider";
  const externalId = accountMetadata?.accountId ?? accountMetadata?.projectId ?? accountMetadata?.workspaceId ?? provider;
  return `${accountType}:${provider}:${externalId}`;
}

export function createExternalAccountRegistry({
  accountType = "unknown",
  accountMetadata = null,
} = {}) {
  const normalizedMetadata = {
    provider: accountMetadata?.provider ?? "unknown-provider",
    accountId: accountMetadata?.accountId ?? null,
    projectId: accountMetadata?.projectId ?? null,
    workspaceId: accountMetadata?.workspaceId ?? null,
    capabilities: Array.isArray(accountMetadata?.capabilities) ? accountMetadata.capabilities : [],
    status: accountMetadata?.status ?? "connected",
    credentialReference: accountMetadata?.credentialReference ?? null,
    connectionMode: accountMetadata?.connectionMode ?? "manual",
    metadata: accountMetadata?.metadata ?? {},
  };

  return {
    accountRecord: {
      ...normalizedMetadata,
      accountId: buildAccountId(accountType, normalizedMetadata),
      accountType,
    },
  };
}
