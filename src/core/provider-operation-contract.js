export function createProviderOperationContract({
  providerSession = null,
} = {}) {
  const operationTypes = Array.isArray(providerSession?.operationTypes) ? providerSession.operationTypes : [];
  const providerType = providerSession?.providerType ?? "generic";

  return {
    providerOperations: operationTypes.map((operationType) => ({
      providerType,
      operationType,
      executionMode: "deferred",
      requiresApproval: operationType === "revoke" || operationType === "submit",
      supported: true,
    })),
  };
}
