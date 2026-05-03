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

function resolveStatus({ invocation, evidence, executionEnvelope }) {
  const blockedReasons = unique([
    ...normalizeArray(invocation.blockedReasons),
    ...normalizeArray(evidence.blockedReasons),
    executionEnvelope.summary?.isReadyForDeploymentReality === true ? null : "execution-envelope-unready",
    evidence.summary?.canAdvanceToDeploymentResult === true ? null : "deployment-evidence-unready",
  ]);
  if (blockedReasons.length > 0) {
    return { status: "blocked", blockedReasons };
  }
  return { status: "ready", blockedReasons: [] };
}

function resolveOutcome(status) {
  if (status === "blocked") {
    return "blocked";
  }
  if (status === "ready") {
    return "accepted";
  }
  return "pending";
}

export function createDeploymentResultEnvelope({
  deploymentInvocation = null,
  deploymentEvidence = null,
  canonicalExecutionResultEnvelope = null,
} = {}) {
  const invocation = normalizeObject(deploymentInvocation);
  const evidence = normalizeObject(deploymentEvidence);
  const executionEnvelope = normalizeObject(canonicalExecutionResultEnvelope);
  const { status, blockedReasons } = resolveStatus({
    invocation,
    evidence,
    executionEnvelope,
  });
  const outcome = resolveOutcome(status);
  const requestId = normalizeString(invocation.requestId, normalizeString(evidence.requestId, "unknown-deployment-request"));

  return {
    deploymentResultEnvelope: {
      deploymentResultEnvelopeId: `deployment-result:${requestId}`,
      status,
      outcome,
      requestId,
      provider: normalizeString(invocation.provider, normalizeString(evidence.provider, "generic")),
      target: normalizeString(invocation.target, normalizeString(evidence.target, "private-deployment")),
      environment: normalizeString(invocation.environment, normalizeString(evidence.environment, "staging")),
      invocationReceipt: invocation.invocationReceipt ?? evidence.receipt ?? null,
      resultPayload: {
        invocationStatus: normalizeString(invocation.status, "blocked"),
        evidenceStatus: normalizeString(evidence.status, "blocked"),
        executionOutcome: normalizeString(executionEnvelope.outcome, "pending"),
        artifactCount: Number.isFinite(evidence.summary?.artifactCount) ? evidence.summary.artifactCount : normalizeArray(evidence.artifacts).length,
      },
      artifacts: normalizeArray(evidence.artifacts),
      outputPaths: normalizeArray(evidence.outputPaths),
      evidenceRefs: unique([
        ...normalizeArray(evidence.evidenceRefs),
        ...normalizeArray(executionEnvelope.evidenceRefs),
      ]).filter(Boolean),
      blockedReasons,
      summary: {
        hasReceipt: Boolean((invocation.invocationReceipt ?? evidence.receipt)?.receiptId),
        hasArtifacts: normalizeArray(evidence.artifacts).length > 0,
        isReadyForLaunchVerification: blockedReasons.length === 0 && outcome === "accepted",
      },
    },
  };
}
