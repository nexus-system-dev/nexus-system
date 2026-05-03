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

function buildCollectedArtifacts(preparedArtifact) {
  return normalizeArray(preparedArtifact.artifacts).map((artifact, index) => ({
    artifactId: `collected-artifact-${index + 1}`,
    name: normalizeString(artifact, `artifact-${index + 1}`),
    outputPath: `dist/${normalizeString(artifact, `artifact-${index + 1}`)}`,
    packageFormat: normalizeString(preparedArtifact.packageFormat, "generic-bundle"),
    environment: normalizeString(preparedArtifact.environment, "staging"),
  }));
}

export function createArtifactCollectionPipeline({
  executionInvocationContract = null,
  ideAgentResultNormalization = null,
  preparedArtifact = null,
  externalExecutionResult = null,
} = {}) {
  const invocation = normalizeObject(executionInvocationContract);
  const normalizedResult = normalizeObject(ideAgentResultNormalization);
  const artifact = normalizeObject(preparedArtifact);
  const result = normalizeObject(externalExecutionResult);
  const blockedReasons = unique([
    ...normalizeArray(invocation.blockedReasons),
    ...normalizeArray(normalizedResult.blockedReasons),
    normalizeArray(artifact.artifacts).length === 0 ? "artifacts-missing" : null,
  ]);
  const collectedArtifacts = buildCollectedArtifacts(artifact);
  const status = blockedReasons.length > 0 ? "blocked" : invocation.status === "invoked" ? "collecting" : "ready";

  return {
    artifactCollectionPipeline: {
      artifactCollectionPipelineId: `artifact-collection:${normalizeString(invocation.executionRequestId, "unknown-request")}`,
      status,
      collectionStage: status === "blocked" ? "collection-blocked" : status === "collecting" ? "evidence-collecting" : "collection-ready",
      executionRequestId: normalizeString(invocation.executionRequestId, null),
      packageFormat: normalizeString(artifact.packageFormat, "generic-bundle"),
      providerType: normalizeString(invocation.invocationTarget?.providerType, normalizeString(result.providerType, "generic")),
      environment: normalizeString(artifact.environment, "staging"),
      collectedArtifacts,
      evidenceRefs: unique([
        ...normalizeArray(invocation.evidenceRefs).map((entry) => entry.reference),
        ...normalizeArray(normalizedResult.evidenceRefs).map((entry) => entry.reference),
      ]).filter(Boolean),
      collectionSources: {
        invocationContractId: normalizeString(invocation.executionInvocationContractId, null),
        normalizedResultId: normalizeString(normalizedResult.ideAgentResultNormalizationId, null),
        externalExecutionResultId: normalizeString(result.externalExecutionResultId, null),
      },
      blockedReasons,
      summary: {
        artifactCount: collectedArtifacts.length,
        hasEvidenceRefs: unique([
          ...normalizeArray(invocation.evidenceRefs).map((entry) => entry.reference),
          ...normalizeArray(normalizedResult.evidenceRefs).map((entry) => entry.reference),
        ]).filter(Boolean).length > 0,
        canPromoteToResultEnvelope: blockedReasons.length === 0 && collectedArtifacts.length > 0,
      },
    },
  };
}
