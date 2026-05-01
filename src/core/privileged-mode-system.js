function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

export function createPrivilegedModeSystem({
  stepUpAuthDecision = null,
  sensitiveActionConfirmation = null,
  requestContext = null,
} = {}) {
  const activatePrivilegedMode = normalizeBoolean(requestContext?.activatePrivilegedMode, false);
  const hasBlockingDecision = stepUpAuthDecision?.decision === "blocked" || sensitiveActionConfirmation?.isBlocked === true;
  const hasPendingConfirmation = stepUpAuthDecision?.decision === "required"
    || sensitiveActionConfirmation?.requiresConfirmation === true;

  let decision = "disabled";
  let state = "inactive";

  if (hasBlockingDecision) {
    decision = "blocked";
    state = "blocked";
  } else if (hasPendingConfirmation) {
    decision = "pending-step-up";
    state = "pending";
  } else if (activatePrivilegedMode) {
    decision = "active";
    state = "active";
  } else if (sensitiveActionConfirmation?.decision === "confirmed") {
    decision = "ready";
    state = "ready";
  }

  return {
    privilegedModeState: {
      privilegedModeStateId: `privileged-mode:${stepUpAuthDecision?.stepUpAuthDecisionId ?? "unknown"}`,
      decision,
      state,
      canEnterPrivilegedMode: decision === "ready" || decision === "active",
      isActive: decision === "active",
      requiresStepUp: hasPendingConfirmation,
      checks: [
        `step-up:${stepUpAuthDecision?.decision ?? "not-required"}`,
        `confirmation:${sensitiveActionConfirmation?.decision ?? "not-required"}`,
      ],
    },
  };
}
