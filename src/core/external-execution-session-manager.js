function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function slugify(value) {
  return normalizeString(value, "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveSessionStatus(externalExecutionResult) {
  const resultStatus = normalizeString(externalExecutionResult.status, "blocked");
  if (resultStatus === "dispatched") {
    return "active";
  }
  if (resultStatus === "blocked") {
    return "blocked";
  }
  return "planned";
}

export function createExternalExecutionSessionManager({
  externalExecutionResult = null,
  executionProviderCapabilitySync = null,
  actionToProviderMapping = null,
} = {}) {
  const result = normalizeObject(externalExecutionResult);
  const capabilitySync = normalizeObject(executionProviderCapabilitySync);
  const mapping = normalizeObject(actionToProviderMapping);
  const sessionStatus = resolveSessionStatus(result);
  const executionRequestId = normalizeString(result.executionRequestId, "unknown-request");
  const blockedReasons = [
    ...(Array.isArray(result.blockedReasons) ? result.blockedReasons.filter(Boolean) : []),
    capabilitySync.summary?.isSynchronized === true ? null : "provider-capability-sync-unready",
  ].filter(Boolean);

  return {
    externalExecutionSession: {
      externalExecutionSessionId: `external-execution-session:${slugify(executionRequestId)}`,
      executionRequestId,
      status: blockedReasons.length === 0 ? sessionStatus : "blocked",
      providerType: normalizeString(result.providerType, normalizeString(mapping.providerType, "generic")),
      lifecycleState: normalizeString(result.lifecycleState, "prepare-blocked"),
      receipt: result.receipt ?? null,
      sessionBinding: {
        targetSurface: normalizeString(mapping.targetSurface, null),
        providerType: normalizeString(mapping.providerType, "generic"),
        capabilitySyncId: normalizeString(capabilitySync.executionProviderCapabilitySyncId, null),
      },
      reconciliation: {
        stateUpdateStatus: normalizeString(result.stateUpdateProposal?.status, "missing"),
        nextPatchType: normalizeString(result.stateUpdateProposal?.patchType, "no-op"),
        nextAction:
          sessionStatus === "active"
            ? "await-provider-result"
            : blockedReasons.length > 0
              ? "resolve-blockers"
              : "manual-review",
      },
      blockedReasons,
      summary: {
        hasReceipt: Boolean(result.receipt?.receiptId),
        isDispatchActive: blockedReasons.length === 0 && sessionStatus === "active",
        canReconcile: blockedReasons.length === 0 && normalizeString(result.stateUpdateProposal?.status) === "pending-reconcile",
      },
    },
  };
}
