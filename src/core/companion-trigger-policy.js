function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeString(value, fallback) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveDecision({ companionState, policyTrace, executionStatus }) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedExecutionStatus = normalizeObject(executionStatus);
  const state = normalizeString(
    normalizedCompanionState.state,
    normalizeString(normalizedCompanionState.mode, "observing"),
  ).toLowerCase();
  const executionMode = normalizeString(normalizedExecutionStatus.mode, "interactive").toLowerCase();
  const runStatus = normalizeString(normalizedExecutionStatus.status, "idle").toLowerCase();

  if (executionMode === "critical-run" || runStatus === "running-critical") {
    return "stay-quiet";
  }

  if (normalizedPolicyTrace.requiresApproval === true || state === "warning") {
    return "interrupt";
  }

  if (state === "recommending" || state === "analyzing") {
    return "show";
  }

  return "stay-quiet";
}

function buildVisibility(decisionType) {
  return {
    visible: decisionType !== "stay-quiet",
    inline: decisionType === "show",
    dockBadge: decisionType === "interrupt",
  };
}

function buildSummary({ decisionType, policyTrace, executionStatus }) {
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedExecutionStatus = normalizeObject(executionStatus);

  return {
    decisionType,
    requiresApproval: normalizedPolicyTrace.requiresApproval === true,
    blockedByPolicy: normalizeString(normalizedPolicyTrace.finalDecision, "").toLowerCase() === "blocked",
    executionMode: normalizeString(normalizedExecutionStatus.mode, "interactive").toLowerCase(),
    canInterrupt: decisionType === "interrupt",
  };
}

export function createCompanionTriggerPolicy({
  companionState = null,
  policyTrace = null,
  executionStatus = null,
} = {}) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedExecutionStatus = normalizeObject(executionStatus);
  const decisionType = resolveDecision({
    companionState: normalizedCompanionState,
    policyTrace: normalizedPolicyTrace,
    executionStatus: normalizedExecutionStatus,
  });

  return {
    companionTriggerDecision: {
      decisionId: `companion-trigger:${normalizeString(normalizedExecutionStatus.projectId, "project")}`,
      decisionType,
      visibility: buildVisibility(decisionType),
      reasons: [
        normalizeString(
          normalizedPolicyTrace.reason,
          normalizeString(
            normalizedCompanionState.reasons?.[0],
            "No trigger reason is available yet.",
          ),
        ),
      ],
      summary: buildSummary({
        decisionType,
        policyTrace: normalizedPolicyTrace,
        executionStatus: normalizedExecutionStatus,
      }),
    },
  };
}
