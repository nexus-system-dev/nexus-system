export function createDependentConnectorResolver({
  project = null,
  linkedAccounts = null,
  credentialReference = null,
} = {}) {
  const normalizedReference =
    typeof credentialReference === "string" && credentialReference.trim()
      ? credentialReference.trim()
      : credentialReference?.credentialReference ?? null;
  const accounts = Array.isArray(linkedAccounts)
    ? linkedAccounts
    : Array.isArray(project?.linkedAccounts)
      ? project.linkedAccounts
      : [];

  const affectedConnectors = accounts
    .map((account, index) => ({ account, index }))
    .filter(({ account }) => {
      const accountReference = account?.credentialReference
        ?? account?.accountRecord?.credentialReference
        ?? account?.credentialVaultRecord?.credentialReference
        ?? null;
      return normalizedReference && accountReference === normalizedReference;
    })
    .map(({ account, index }) => ({
      index,
      accountId: account?.accountRecord?.accountId ?? null,
      provider: account?.accountRecord?.provider ?? account?.providerSession?.providerType ?? "unknown-provider",
      accountType: account?.accountRecord?.accountType ?? null,
      credentialReference: normalizedReference,
      linkedAccount: account,
    }));

  return {
    affectedConnectors,
  };
}
