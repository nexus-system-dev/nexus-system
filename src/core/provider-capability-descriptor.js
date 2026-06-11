export function createProviderCapabilityDescriptor({
  providerSession = null,
} = {}) {
  const capabilities = Array.isArray(providerSession?.capabilities) ? providerSession.capabilities : [];
  const authenticationModes = Array.isArray(providerSession?.authenticationModes)
    ? providerSession.authenticationModes
    : [];
  const operationTypes = Array.isArray(providerSession?.operationTypes) ? providerSession.operationTypes : [];
  const scopes = Array.isArray(providerSession?.scopes) ? providerSession.scopes : [];
  const providerType = providerSession?.providerType ?? "generic";
  const sideEffectingOperations = ["send", "submit", "deploy", "publish", "spend", "charge", "refund", "delete", "generate", "export"];
  const approvalRequiredOperations = operationTypes.filter((operationType) => sideEffectingOperations.includes(operationType));

  return {
    providerCapabilities: {
      providerType,
      capabilities,
      authenticationModes,
      operationTypes,
      scopes,
      supportsDeploy: capabilities.includes("deploy"),
      supportsSubmission: capabilities.includes("submit"),
      supportsPolling: operationTypes.includes("poll"),
      supportsCreativeGeneration: capabilities.includes("generate") || providerType === "creative",
      supportsExternalSend: capabilities.includes("send") || operationTypes.includes("send"),
      supportsSpend: capabilities.includes("spend") || operationTypes.includes("spend") || operationTypes.includes("charge"),
      capabilityMetadata: operationTypes.map((operationType) => ({
        operationType,
        modes: {
          concept: operationType === "concept",
          draft: ["concept", "draft", "validate", "test"].includes(operationType),
          generate: operationType === "generate",
          edit: operationType === "edit",
          import: operationType === "import",
          export: operationType === "export",
          publish: operationType === "publish",
          schedule: operationType === "schedule",
          spend: operationType === "spend" || operationType === "charge",
          delete: operationType === "delete" || operationType === "revoke",
          trainReference: operationType === "train-reference",
          brandSafe: capabilities.includes("brand-safe"),
        },
        requiresApproval: sideEffectingOperations.includes(operationType) || operationType === "revoke",
      })),
      approvalRequiredOperations,
    },
  };
}
