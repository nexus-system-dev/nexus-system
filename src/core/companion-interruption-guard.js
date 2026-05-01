function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeString(value, fallback = "") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function isCriticalExecution(normalizedTriggerDecision, normalizedProgressState) {
  const normalizedStatus = normalizeString(normalizedProgressState.status).toLowerCase();
  const normalizedExecutionMode = normalizeString(normalizedTriggerDecision.summary?.executionMode).toLowerCase();

  return normalizedStatus === "running"
    || normalizedStatus === "running-critical"
    || normalizedExecutionMode === "critical-run";
}

function requiresApprovalGuard(normalizedTriggerDecision) {
  return normalizedTriggerDecision.summary?.requiresApproval === true;
}

function resolveDecision({ companionTriggerDecision, progressState }) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedProgressState = normalizeObject(progressState);
  const normalizedDecisionType = normalizeString(normalizedTriggerDecision.decisionType).toLowerCase();

  if (isCriticalExecution(normalizedTriggerDecision, normalizedProgressState)) {
    return "suppress";
  }

  if (normalizedDecisionType === "stay-quiet") {
    return "suppress";
  }

  if (requiresApprovalGuard(normalizedTriggerDecision)) {
    return "guarded";
  }

  if (normalizedDecisionType === "interrupt") {
    return "allow";
  }

  return "suppress";
}

function buildSummary(decision, companionTriggerDecision, progressState) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedProgressState = normalizeObject(progressState);

  return {
    decision,
    blockedByCriticalExecution: isCriticalExecution(normalizedTriggerDecision, normalizedProgressState),
    blockedByApprovalSensitivity: requiresApprovalGuard(normalizedTriggerDecision),
    blockedByQuietMode: normalizeString(normalizedTriggerDecision.decisionType).toLowerCase() === "stay-quiet",
    canInterrupt: decision === "allow",
  };
}

export function createCompanionInterruptionGuard({
  companionTriggerDecision = null,
  progressState = null,
} = {}) {
  const normalizedTriggerDecision = normalizeObject(companionTriggerDecision);
  const normalizedProgressState = normalizeObject(progressState);
  const decision = resolveDecision({
    companionTriggerDecision: normalizedTriggerDecision,
    progressState: normalizedProgressState,
  });

  const primaryReason = normalizeString(
    normalizedTriggerDecision.reasons?.[0],
    decision === "suppress"
      ? "The companion should remain quiet."
      : "The companion may interrupt with actionable guidance.",
  );

  return {
    interruptionDecision: {
      decisionId: `companion-interruption:${normalizeString(normalizedTriggerDecision.decisionId, "project")}`,
      decision,
      allowed: decision === "allow",
      reasons: [primaryReason],
      summary: buildSummary(
        decision,
        normalizedTriggerDecision,
        normalizedProgressState,
      ),
    },
  };
}
