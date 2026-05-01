function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set((Array.isArray(values) ? values : []).filter(Boolean))];
}

function slugify(value) {
  return normalizeString(value, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeEnvelope(atomicExecutionEnvelope = null) {
  const envelope = normalizeObject(atomicExecutionEnvelope);
  return {
    atomicExecutionEnvelopeId: normalizeString(envelope.atomicExecutionEnvelopeId),
    executionRequestId: normalizeString(envelope.executionRequestId),
    status: normalizeString(envelope.status, "blocked"),
    action: normalizeObject(envelope.action),
    target: normalizeObject(envelope.target),
    atomicityContract: normalizeObject(envelope.atomicityContract),
    blockedReasons: Array.isArray(envelope.blockedReasons) ? envelope.blockedReasons.filter(Boolean) : [],
    canDispatch: envelope.canDispatch === true,
  };
}

function normalizeResolvedExecutionConfig(resolvedExecutionConfig = null) {
  const normalized = normalizeObject(resolvedExecutionConfig);
  const providerConnector = normalizeObject(normalized.providerConnector);
  const providerSession = normalizeObject(normalized.providerSession);
  const providerOperations = Array.isArray(providerConnector.operations) ? providerConnector.operations : [];

  return {
    providerType: normalizeString(normalized.providerType)
      ?? normalizeString(providerConnector.providerType)
      ?? normalizeString(providerSession.providerType)
      ?? "generic",
    connectorStatus: normalizeString(normalized.connectorStatus)
      ?? normalizeString(providerConnector.status)
      ?? normalizeString(providerSession.status)
      ?? "unknown",
    operationTypes: unique([
      ...(Array.isArray(normalized.operationTypes) ? normalized.operationTypes : []),
      ...(Array.isArray(providerSession.operationTypes) ? providerSession.operationTypes : []),
      ...providerOperations.map((operation) => operation?.operationType).filter(Boolean),
    ]),
    capabilities: unique([
      ...(Array.isArray(normalized.capabilities) ? normalized.capabilities : []),
      ...(Array.isArray(providerSession.capabilities) ? providerSession.capabilities : []),
      ...providerOperations.map((operation) => operation?.providerType).filter(Boolean),
    ]),
    targetSurface: normalizeString(normalized.targetSurface)
      ?? normalizeString(normalized.executionMode)
      ?? normalizeString(normalized.selectedMode)
      ?? null,
    credentialReference: normalizeString(normalized.credentialReference)
      ?? normalizeString(providerSession.credentialReference)
      ?? null,
    artifactCount: Number.isFinite(normalized.artifactCount) ? normalized.artifactCount : 0,
  };
}

export function createExternalExecutionDispatchModule({
  atomicExecutionEnvelope = null,
  resolvedExecutionConfig = null,
} = {}) {
  const envelope = normalizeEnvelope(atomicExecutionEnvelope);
  const config = normalizeResolvedExecutionConfig(resolvedExecutionConfig);
  const requestedOperation = normalizeString(envelope.action.requestedOperation, "validate");
  const providerSupportsOperation = config.operationTypes.includes(requestedOperation);
  const providerConnected = ["connected", "ready"].includes(config.connectorStatus);
  const dispatchable = envelope.canDispatch && providerSupportsOperation && providerConnected;
  const blockedReasons = unique([
    ...envelope.blockedReasons,
    !providerSupportsOperation ? "operation-unsupported" : null,
    !providerConnected ? "provider-disconnected" : null,
  ]);
  const dispatchDecision = dispatchable ? "accepted" : "blocked";

  return {
    externalExecutionResult: {
      externalExecutionResultId: `external-execution:${slugify(envelope.executionRequestId)}`,
      atomicExecutionEnvelopeId: envelope.atomicExecutionEnvelopeId,
      executionRequestId: envelope.executionRequestId,
      providerType: config.providerType,
      dispatchDecision,
      status: dispatchable ? "dispatched" : "blocked",
      providerResultStatus: dispatchable ? "accepted" : "not-dispatched",
      dispatchedOperation: requestedOperation,
      executionSurface: config.targetSurface ?? envelope.target.targetSurface ?? null,
      lifecycleState: dispatchable ? "reconcile-pending" : "prepare-blocked",
      receipt: dispatchable
        ? {
            receiptId: `dispatch-receipt:${slugify(envelope.executionRequestId)}`,
            providerType: config.providerType,
            credentialReference: config.credentialReference,
            artifactCount: config.artifactCount,
          }
        : null,
      stateUpdateProposal: {
        status: dispatchable ? "pending-reconcile" : "blocked",
        patchType: dispatchable ? "external-action-pending" : "no-op",
        actionType: envelope.action.actionType ?? "unknown",
      },
      storedEvidence: [
        envelope.atomicityContract.idempotencyKey
          ? {
              evidenceType: "idempotency-key",
              reference: envelope.atomicityContract.idempotencyKey,
            }
          : null,
        dispatchable
          ? {
              evidenceType: "provider-receipt",
              reference: `dispatch-receipt:${slugify(envelope.executionRequestId)}`,
            }
          : null,
      ].filter(Boolean),
      blockedReasons,
      summary: {
        isDispatchable: dispatchable,
        providerSupportsOperation,
        providerConnected,
      },
    },
  };
}
