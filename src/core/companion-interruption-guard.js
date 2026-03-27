function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolveDecision({ companionTriggerDecision, gatingDecision, progressState }) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedProgressState = normalizeObject(progressState);
  const progressStatus = normalizedProgressState.status ?? "idle";

  if (
    progressStatus === "running"
    || progressStatus === "running-critical"
    || normalizedTriggerDecision.summary?.executionMode === "critical-run"
  ) {
    return "suppress";
  }

  if (
    normalizedGatingDecision.requiresApproval === true
    || normalizedGatingDecision.decision === "requires-approval"
  ) {
    return "guarded";
  }

  if (normalizedTriggerDecision.decisionType === "interrupt") {
    return "allow";
  }

  return "soft-allow";
}

function buildSummary(decision, companionTriggerDecision, gatingDecision, progressState) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedProgressState = normalizeObject(progressState);

  return {
    decision,
    blockedByCriticalExecution:
      normalizedProgressState.status === "running"
      || normalizedProgressState.status === "running-critical"
      || normalizedTriggerDecision.summary?.executionMode === "critical-run",
    blockedByApprovalSensitivity:
      normalizedGatingDecision.requiresApproval === true
      || normalizedGatingDecision.decision === "requires-approval",
    canInterrupt: decision === "allow",
  };
}

export function createCompanionInterruptionGuard({
  companionTriggerDecision = null,
  gatingDecision = null,
  progressState = null,
} = {}) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedGatingDecision = normalizeObject(gatingDecision);
  const normalizedProgressState = normalizeObject(progressState);
  const decision = resolveDecision({
    companionTriggerDecision: normalizedTriggerDecision,
    gatingDecision: normalizedGatingDecision,
    progressState: normalizedProgressState,
  });

  return {
    interruptionDecision: {
      decisionId: `companion-interruption:${normalizedTriggerDecision.decisionId ?? "project"}`,
      decision,
      allowed: decision === "allow" || decision === "soft-allow",
      reasons: [
        normalizedGatingDecision.reason
          ?? normalizedTriggerDecision.reasons?.[0]
          ?? "No interruption guard reason is available yet.",
      ],
      summary: buildSummary(
        decision,
        normalizedTriggerDecision,
        normalizedGatingDecision,
        normalizedProgressState,
      ),
    },
  };
}
