function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function mapFailureCategory(checkKey) {
  switch (checkKey) {
    case "request-contract":
      return "missing-request-contract";
    case "response-contract":
      return "missing-response-contract";
    case "provider-execution":
      return "provider-execution-failure";
    case "service-envelope":
      return "service-envelope-failure";
    case "execution-state":
      return "execution-state-failure";
    case "renderability":
      return "renderability-failure";
    case "validation":
      return "validation-failure";
    case "review":
      return "review-handoff-failure";
    case "apply-readiness":
      return "apply-readiness-failure";
    default:
      return "unknown-contract-failure";
  }
}

function buildActiveFailures(contractChecks = []) {
  return normalizeArray(contractChecks)
    .filter((check) => ["missing", "blocked", "invalid"].includes(check?.status))
    .map((check) => ({
      key: normalizeString(check.key, "unknown"),
      status: normalizeString(check.status, "unknown"),
      category: mapFailureCategory(check.key),
      reason: normalizeString(check.reason, "Prompt contract failure is present."),
    }));
}

export function createPromptContractFailureTracker({
  aiGenerationObservability = null,
  aiDesignExecutionState = null,
  aiDesignServiceResult = null,
} = {}) {
  const observability = normalizeObject(aiGenerationObservability);
  const executionState = normalizeObject(aiDesignExecutionState);
  const serviceResult = normalizeObject(aiDesignServiceResult);
  const activeFailures = buildActiveFailures(observability.contractChecks);
  const blockingFailureCount = activeFailures.length;
  const executionStatus = normalizeString(executionState.status, "unknown");
  const providerStatus = normalizeString(serviceResult.status, "unknown");
  const failureStatus =
    blockingFailureCount > 0
      ? "needs-attention"
      : executionStatus === "generated" && providerStatus === "ready"
        ? "clear"
        : "unknown";

  return {
    promptContractFailureTracker: {
      trackerId: `prompt-contract-failure:${normalizeString(observability.observabilityId, executionState.executionStateId ?? "unknown")}`,
      observabilityId: normalizeString(observability.observabilityId),
      executionStateId: normalizeString(executionState.executionStateId),
      serviceResultId: normalizeString(serviceResult.serviceResultId),
      status: failureStatus,
      activeFailures,
      failureSummary: {
        blockingFailureCount,
        missingContractCount: activeFailures.filter((failure) => failure.status === "missing").length,
        invalidContractCount: activeFailures.filter((failure) => failure.status === "invalid").length,
        blockedContractCount: activeFailures.filter((failure) => failure.status === "blocked").length,
        executionStatus,
        providerStatus,
        requiresAttention: blockingFailureCount > 0,
      },
      latestFailure:
        activeFailures[0]
          ? {
              category: activeFailures[0].category,
              reason: activeFailures[0].reason,
            }
          : null,
    },
  };
}
