function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function slugify(value) {
  return normalizeString(value, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildCheck(checkId, passed, message) {
  return {
    checkId,
    status: passed ? "passed" : "failed",
    message,
  };
}

export function createExecutionConsistencyValidator({
  atomicExecutionEnvelope = null,
  externalExecutionResult = null,
  projectState = null,
} = {}) {
  const envelope = normalizeObject(atomicExecutionEnvelope);
  const result = normalizeObject(externalExecutionResult);
  const state = normalizeObject(projectState);
  const storedEvidence = normalizeArray(result.storedEvidence);
  const projectAuditRecord = normalizeObject(state.projectAuditRecord);
  const auditLogRecord = normalizeObject(state.auditLogRecord);
  const stateUpdate = normalizeObject(result.stateUpdateProposal);

  const actionAligned = normalizeString(envelope.action?.requestedOperation, "validate") === normalizeString(result.dispatchedOperation, "validate");
  const providerAligned = normalizeString(envelope.target?.providerType, "generic") === normalizeString(result.providerType, "generic");
  const blockedStateAligned =
    (envelope.status === "blocked" && result.status === "blocked")
    || (envelope.status === "ready" && ["dispatched", "blocked"].includes(result.status));
  const stateUpdateAligned =
    (result.status === "dispatched" && stateUpdate.status === "pending-reconcile")
    || (result.status === "blocked" && stateUpdate.status === "blocked");
  const evidenceCovered =
    storedEvidence.length > 0
    || Boolean(projectAuditRecord.projectAuditRecordId)
    || Boolean(auditLogRecord.auditLogId);

  const checks = [
    buildCheck("action-alignment", actionAligned, actionAligned
      ? "Requested operation matches dispatched operation."
      : "Requested operation drifted from dispatched operation."),
    buildCheck("provider-alignment", providerAligned, providerAligned
      ? "Envelope provider matches dispatch provider."
      : "Dispatch provider drifted from the envelope target."),
    buildCheck("blocked-state-alignment", blockedStateAligned, blockedStateAligned
      ? "Envelope readiness and dispatch state are aligned."
      : "Dispatch state does not match envelope readiness."),
    buildCheck("state-update-alignment", stateUpdateAligned, stateUpdateAligned
      ? "State update proposal matches dispatch lifecycle."
      : "State update proposal does not match dispatch lifecycle."),
    buildCheck("evidence-coverage", evidenceCovered, evidenceCovered
      ? "Execution emitted usable evidence for reconciliation."
      : "Execution is missing stored evidence for reconciliation."),
  ];

  const failedChecks = checks.filter((check) => check.status === "failed").map((check) => check.checkId);
  const isConsistent = failedChecks.length === 0;

  return {
    executionConsistencyReport: {
      executionConsistencyReportId: `execution-consistency:${slugify(result.executionRequestId ?? envelope.executionRequestId)}`,
      atomicExecutionEnvelopeId: normalizeString(envelope.atomicExecutionEnvelopeId),
      externalExecutionResultId: normalizeString(result.externalExecutionResultId),
      status: isConsistent ? "consistent" : "inconsistent",
      requestedAction: normalizeString(envelope.action?.actionType, "unknown"),
      dispatchedOperation: normalizeString(result.dispatchedOperation, "unknown"),
      providerType: normalizeString(result.providerType) ?? normalizeString(envelope.target?.providerType) ?? "generic",
      checks,
      failedChecks,
      driftSignals: failedChecks,
      evidenceCoverage: {
        evidenceCount: storedEvidence.length,
        hasProjectAuditRecord: Boolean(projectAuditRecord.projectAuditRecordId),
        hasAuditLogRecord: Boolean(auditLogRecord.auditLogId),
      },
      stateUpdateDecision: {
        stateUpdateStatus: stateUpdate.status ?? "missing",
        canAdvance: isConsistent && result.status === "dispatched",
        nextLifecycleState: isConsistent && result.status === "dispatched" ? "ready-for-reconcile" : "manual-review",
      },
      summary: {
        isConsistent,
        requiresManualReview: !isConsistent,
      },
    },
  };
}
