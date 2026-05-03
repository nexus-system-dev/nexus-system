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

function resolveStatus({ invocation, normalizedResult, artifactPipeline, externalResult }) {
  const blockedReasons = unique([
    ...normalizeArray(invocation.blockedReasons),
    ...normalizeArray(normalizedResult.blockedReasons),
    ...normalizeArray(artifactPipeline.blockedReasons),
  ]);
  if (blockedReasons.length > 0) {
    return "blocked";
  }
  if (normalizedResult.status === "failed") {
    return "failed";
  }
  if (artifactPipeline.summary?.canPromoteToResultEnvelope === true && normalizeString(externalResult.status) === "dispatched") {
    return "ready";
  }
  return "planned";
}

function resolveOutcome(status) {
  if (status === "blocked") {
    return "blocked";
  }
  if (status === "failed") {
    return "failed";
  }
  if (status === "ready") {
    return "accepted";
  }
  return "pending";
}

export function createCanonicalExecutionResultEnvelope({
  executionInvocationContract = null,
  ideAgentResultNormalization = null,
  artifactCollectionPipeline = null,
  externalExecutionResult = null,
  externalExecutionSession = null,
} = {}) {
  const invocation = normalizeObject(executionInvocationContract);
  const normalizedResult = normalizeObject(ideAgentResultNormalization);
  const artifactPipeline = normalizeObject(artifactCollectionPipeline);
  const externalResult = normalizeObject(externalExecutionResult);
  const session = normalizeObject(externalExecutionSession);
  const blockedReasons = unique([
    ...normalizeArray(invocation.blockedReasons),
    ...normalizeArray(normalizedResult.blockedReasons),
    ...normalizeArray(artifactPipeline.blockedReasons),
  ]);
  const status = resolveStatus({ invocation, normalizedResult, artifactPipeline, externalResult });
  const outcome = resolveOutcome(status);

  return {
    canonicalExecutionResultEnvelope: {
      canonicalExecutionResultEnvelopeId: `canonical-execution-result:${normalizeString(invocation.executionRequestId, "unknown-request")}`,
      status,
      outcome,
      executionRequestId: normalizeString(invocation.executionRequestId, null),
      invocationStage: normalizeString(invocation.invocationStage, "invoke-planned"),
      providerType: normalizeString(invocation.invocationTarget?.providerType, normalizeString(session.providerType, "generic")),
      executorType: normalizeString(invocation.invocationTarget?.executorType, "manual"),
      resultPayload: {
        dispatchDecision: normalizeString(externalResult.dispatchDecision, "blocked"),
        providerResultStatus: normalizeString(externalResult.providerResultStatus, "unknown"),
        normalizedStatus: normalizeString(normalizedResult.status, "planned"),
        collectionStage: normalizeString(artifactPipeline.collectionStage, "collection-blocked"),
        reconciliationStatus: normalizeString(invocation.reconcileContract?.stateUpdateStatus, "missing"),
      },
      artifacts: normalizeArray(artifactPipeline.collectedArtifacts),
      evidenceRefs: unique([
        ...normalizeArray(invocation.evidenceRefs),
        ...normalizeArray(artifactPipeline.evidenceRefs),
      ]),
      blockedReasons,
      summary: {
        artifactCount: normalizeArray(artifactPipeline.collectedArtifacts).length,
        hasArtifacts: normalizeArray(artifactPipeline.collectedArtifacts).length > 0,
        isReadyForDeploymentReality: blockedReasons.length === 0 && outcome === "accepted",
      },
    },
  };
}
