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

function resolveStatus({ envelope, session, normalizedResult }) {
  if (normalizeArray(envelope.blockedReasons).length > 0 || normalizeArray(session.blockedReasons).length > 0) {
    return "blocked";
  }
  if (normalizedResult.status === "failed") {
    return "failed";
  }
  if (normalizedResult.status === "running" && normalizeString(session.status) === "active") {
    return "invoked";
  }
  if (envelope.canDispatch === true) {
    return "ready";
  }
  return "planned";
}

function resolveInvocationStage(status) {
  if (status === "blocked") {
    return "prepare-blocked";
  }
  if (status === "failed") {
    return "invoke-failed";
  }
  if (status === "invoked") {
    return "reconcile-pending";
  }
  if (status === "ready") {
    return "invoke-ready";
  }
  return "invoke-planned";
}

export function createExecutionInvocationContract({
  atomicExecutionEnvelope = null,
  externalExecutionSession = null,
  ideAgentResultNormalization = null,
  ideAgentExecutorContract = null,
} = {}) {
  const envelope = normalizeObject(atomicExecutionEnvelope);
  const session = normalizeObject(externalExecutionSession);
  const normalizedResult = normalizeObject(ideAgentResultNormalization);
  const executor = normalizeObject(ideAgentExecutorContract);
  const blockedReasons = unique([
    ...normalizeArray(envelope.blockedReasons),
    ...normalizeArray(session.blockedReasons),
    ...normalizeArray(normalizedResult.blockedReasons),
  ]);
  const resolvedStatus = resolveStatus({ envelope, session, normalizedResult });
  const status = blockedReasons.length > 0 ? "blocked" : resolvedStatus;
  const executionRequestId = normalizeString(envelope.executionRequestId, normalizeString(session.executionRequestId, "unknown-request"));

  return {
    executionInvocationContract: {
      executionInvocationContractId: `execution-invocation:${executionRequestId}`,
      status,
      invocationStage: resolveInvocationStage(status),
      executionRequestId,
      invocationTarget: {
        targetSurface: normalizeString(envelope.target?.targetSurface, normalizeString(executor.targetSurface, null)),
        executionMode: normalizeString(envelope.target?.executionMode, normalizeString(executor.selectedMode, "manual")),
        providerType: normalizeString(session.providerType, normalizeString(envelope.target?.providerType, "generic")),
        executorType: normalizeString(executor.executorType, "manual"),
      },
      invocationPayload: {
        actionType: normalizeString(envelope.action?.actionType, "unknown"),
        requestedOperation: normalizeString(envelope.action?.requestedOperation, "validate"),
        workflow: normalizeString(envelope.action?.workflow, null),
        policyDecision: normalizeString(envelope.policyPosture?.policyDecision, "unknown"),
        approvalStatus: normalizeString(envelope.policyPosture?.approvalStatus, "missing"),
        credentialReference: normalizeString(envelope.atomicityContract?.credentialReference, null),
      },
      reconcileContract: {
        prepareRequired: envelope.atomicityContract?.prepareRequired === true,
        reconcileRequired: envelope.atomicityContract?.reconcileRequired === true,
        abortOnFailure: envelope.atomicityContract?.abortOnFailure === true,
        stateUpdateStatus: normalizeString(session.reconciliation?.stateUpdateStatus, normalizeString(normalizedResult.normalizedResult?.reconciliationStatus, "missing")),
        nextPatchType: normalizeString(session.reconciliation?.nextPatchType, normalizeString(normalizedResult.normalizedResult?.nextPatchType, "no-op")),
      },
      evidenceRefs: normalizeArray(normalizedResult.evidenceRefs),
      blockedReasons,
      summary: {
        canInvoke: blockedReasons.length === 0 && (status === "ready" || status === "invoked"),
        hasHandoffTarget: Boolean(envelope.target?.targetSurface || executor.targetSurface),
        requiresReconcile: envelope.atomicityContract?.reconcileRequired === true,
      },
    },
  };
}
