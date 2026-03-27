function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolveDecision({ companionState, policyTrace, executionStatus }) {
  const normalizedCompanionState = normalizeObject(companionState);
  const normalizedPolicyTrace = normalizeObject(policyTrace);
  const normalizedExecutionStatus = normalizeObject(executionStatus);
  const state = normalizedCompanionState.state ?? normalizedCompanionState.mode ?? "observing";
  const executionMode = normalizedExecutionStatus.mode ?? "interactive";
  const runStatus = normalizedExecutionStatus.status ?? "idle";

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
    blockedByPolicy: normalizedPolicyTrace.finalDecision === "blocked",
    executionMode: normalizedExecutionStatus.mode ?? "interactive",
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
      decisionId: `companion-trigger:${normalizedExecutionStatus.projectId ?? "project"}`,
      decisionType,
      visibility: buildVisibility(decisionType),
      reasons: [
        normalizedPolicyTrace.reason
          ?? normalizedCompanionState.reasons?.[0]
          ?? "No trigger reason is available yet.",
      ],
      summary: buildSummary({
        decisionType,
        policyTrace: normalizedPolicyTrace,
        executionStatus: normalizedExecutionStatus,
      }),
    },
  };
}
