export function createProviderOperationContract({
  providerSession = null,
} = {}) {
  const operationTypes = Array.isArray(providerSession?.operationTypes) ? providerSession.operationTypes : [];
  const providerType = providerSession?.providerType ?? "generic";
  const approvalRequiredOperations = new Set([
    "submit",
    "deploy",
    "publish",
    "send",
    "spend",
    "charge",
    "refund",
    "delete",
    "generate",
    "export",
    "revoke",
    "train-reference",
  ]);
  const externalWriteOperations = new Set([
    "submit",
    "deploy",
    "publish",
    "send",
    "spend",
    "charge",
    "refund",
    "delete",
    "export",
    "revoke",
  ]);

  return {
    providerOperations: operationTypes.map((operationType) => ({
      providerType,
      operationType,
      executionMode: "deferred",
      requiresApproval: approvalRequiredOperations.has(operationType),
      externalSideEffect: externalWriteOperations.has(operationType),
      scopeFamily: operationType === "charge" ? "spend" : operationType,
      supported: true,
    })),
  };
}
