function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createCriticalOperationGuardrails({
  ownerAccessDecision = null,
  sensitiveActionConfirmation = null,
  requestContext = null,
} = {}) {
  const operationType = normalizeString(requestContext?.operationType, "standard");
  const critical = normalizeString(requestContext?.operationSensitivity, "standard") === "critical";

  let decision = "allow";
  let reason = "Operation passes owner guardrails";

  if (ownerAccessDecision?.isAllowed !== true) {
    decision = "blocked";
    reason = ownerAccessDecision?.reason ?? "Owner access is not allowed";
  } else if (critical && sensitiveActionConfirmation?.decision !== "confirmed") {
    decision = "confirmation-required";
    reason = "Critical owner operation requires sensitive action confirmation";
  }

  return {
    criticalOperationDecision: {
      criticalOperationDecisionId: `critical-operation:${operationType}`,
      decision,
      operationType,
      isCritical: critical,
      isBlocked: decision === "blocked",
      requiresConfirmation: decision === "confirmation-required",
      checks: [
        `owner-access:${ownerAccessDecision?.decision ?? "deny"}`,
        `sensitive-confirmation:${sensitiveActionConfirmation?.decision ?? "not-required"}`,
      ],
      reason,
    },
  };
}
