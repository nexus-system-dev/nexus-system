function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(normalizeArray(values))];
}

function resolveStatus({ resultEnvelope, deploymentRequest, providerAdapter }) {
  const blockedReasons = unique([
    ...normalizeArray(resultEnvelope.blockedReasons),
    normalizeString(deploymentRequest.requestId) ? null : "deployment-request-missing",
    normalizeString(providerAdapter.provider) ? null : "provider-adapter-missing",
    resultEnvelope.summary?.isReadyForDeploymentReality === true ? null : "execution-result-unready",
    normalizeArray(deploymentRequest.buildArtifacts).length > 0 ? null : "deployment-artifacts-missing",
  ]);

  if (blockedReasons.length > 0) {
    return { status: "blocked", blockedReasons };
  }

  return { status: "invoked", blockedReasons: [] };
}

export function createDeploymentInvoker({
  canonicalExecutionResultEnvelope = null,
  deploymentRequest = null,
  providerAdapter = null,
} = {}) {
  const resultEnvelope = normalizeObject(canonicalExecutionResultEnvelope);
  const request = normalizeObject(deploymentRequest);
  const provider = normalizeObject(providerAdapter);
  const { status, blockedReasons } = resolveStatus({
    resultEnvelope,
    deploymentRequest: request,
    providerAdapter: provider,
  });
  const requestId = normalizeString(request.requestId, "unknown-deployment-request");

  return {
    deploymentInvocation: {
      deploymentInvocationId: `deployment-invocation:${requestId}`,
      status,
      provider: normalizeString(provider.provider, normalizeString(request.provider, "generic")),
      target: normalizeString(provider.target, normalizeString(request.target, "private-deployment")),
      environment: normalizeString(request.environment, "staging"),
      requestId,
      executionMode: normalizeString(
        request.deploymentConfig?.executionMode,
        Array.isArray(provider.executionModes) ? provider.executionModes[0] : "manual",
      ),
      buildArtifacts: normalizeArray(request.buildArtifacts),
      providerCapabilities: normalizeArray(provider.capabilities),
      invocationReceipt:
        status === "invoked"
          ? {
              receiptId: `deployment-receipt:${requestId}`,
              provider: normalizeString(provider.provider, normalizeString(request.provider, "generic")),
              environment: normalizeString(request.environment, "staging"),
              artifactCount: normalizeArray(request.buildArtifacts).length,
            }
          : null,
      invocationSummary: {
        requestStrategy: normalizeString(request.deploymentConfig?.strategy, "standard"),
        canCollectEvidenceNext: status === "invoked",
        isProductionTarget: normalizeString(request.environment, "staging") === "production",
      },
      blockedReasons,
    },
  };
}
