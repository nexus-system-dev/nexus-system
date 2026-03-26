export function createProviderConnectorAssembler({
  providerSession = null,
  providerCapabilities = null,
  providerOperations = [],
} = {}) {
  return {
    providerConnector: {
      providerType: providerSession?.providerType ?? providerCapabilities?.providerType ?? "generic",
      session: providerSession ?? null,
      capabilities: providerCapabilities ?? null,
      operations: Array.isArray(providerOperations) ? providerOperations : [],
      status: providerSession?.status ?? "connected",
    },
  };
}
