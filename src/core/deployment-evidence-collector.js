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

function buildOutputPaths(artifacts = []) {
  return normalizeArray(artifacts).map((artifact) => artifact.outputPath ?? `dist/${artifact.name ?? "artifact"}`);
}

export function createDeploymentEvidenceCollector({
  deploymentInvocation = null,
  artifactCollectionPipeline = null,
  canonicalExecutionResultEnvelope = null,
  providerAdapter = null,
} = {}) {
  const invocation = normalizeObject(deploymentInvocation);
  const artifactPipeline = normalizeObject(artifactCollectionPipeline);
  const resultEnvelope = normalizeObject(canonicalExecutionResultEnvelope);
  const provider = normalizeObject(providerAdapter);
  const collectedArtifacts = normalizeArray(artifactPipeline.collectedArtifacts);
  const blockedReasons = unique([
    ...normalizeArray(invocation.blockedReasons),
    invocation.status === "invoked" ? null : "deployment-invocation-unready",
    collectedArtifacts.length > 0 ? null : "deployment-artifacts-missing",
    resultEnvelope.summary?.hasArtifacts === true ? null : "result-envelope-artifacts-missing",
  ]);

  return {
    deploymentEvidence: {
      deploymentEvidenceId: `deployment-evidence:${normalizeString(invocation.requestId, "unknown-deployment-request")}`,
      status: blockedReasons.length === 0 ? "collected" : "blocked",
      provider: normalizeString(invocation.provider, normalizeString(provider.provider, "generic")),
      target: normalizeString(invocation.target, normalizeString(provider.target, "private-deployment")),
      environment: normalizeString(invocation.environment, "staging"),
      requestId: normalizeString(invocation.requestId, null),
      receipt: invocation.invocationReceipt ?? null,
      artifacts: collectedArtifacts,
      outputPaths: buildOutputPaths(collectedArtifacts),
      evidenceRefs: unique([
        ...normalizeArray(resultEnvelope.evidenceRefs),
        normalizeString(invocation.invocationReceipt?.receiptId, null),
      ]).filter(Boolean),
      providerMetadata: {
        executionModes: normalizeArray(provider.executionModes),
        capabilities: normalizeArray(provider.capabilities),
        environments: normalizeArray(provider.environments),
      },
      blockedReasons,
      summary: {
        artifactCount: collectedArtifacts.length,
        hasReceipt: Boolean(invocation.invocationReceipt?.receiptId),
        hasOutputPaths: buildOutputPaths(collectedArtifacts).length > 0,
        canAdvanceToDeploymentResult: blockedReasons.length === 0,
      },
    },
  };
}
