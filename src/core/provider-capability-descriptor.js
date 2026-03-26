export function createProviderCapabilityDescriptor({
  providerSession = null,
} = {}) {
  const capabilities = Array.isArray(providerSession?.capabilities) ? providerSession.capabilities : [];
  const authenticationModes = Array.isArray(providerSession?.authenticationModes)
    ? providerSession.authenticationModes
    : [];
  const operationTypes = Array.isArray(providerSession?.operationTypes) ? providerSession.operationTypes : [];

  return {
    providerCapabilities: {
      providerType: providerSession?.providerType ?? "generic",
      capabilities,
      authenticationModes,
      operationTypes,
      supportsDeploy: capabilities.includes("deploy"),
      supportsSubmission: capabilities.includes("submit"),
      supportsPolling: operationTypes.includes("poll"),
    },
  };
}
