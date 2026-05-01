function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createStepUpAuthenticationSystem({
  deviceTrustDecision = null,
  securitySignals = null,
} = {}) {
  const suspicious = securitySignals?.suspiciousActivity === true;
  const authFailures = Number.isFinite(securitySignals?.authFailures) ? securitySignals.authFailures : 0;
  const highRiskDevice = deviceTrustDecision?.deviceRiskLevel === "high";
  const degradedPosture = deviceTrustDecision?.sessionPosture === "degraded";

  let decision = "not-required";
  let reason = "No additional authentication step is required";

  if (deviceTrustDecision?.decision === "blocked") {
    decision = "blocked";
    reason = deviceTrustDecision.reason;
  } else if (highRiskDevice || degradedPosture || suspicious || authFailures >= 3) {
    decision = "required";
    reason = "Risk signals require a step-up authentication challenge";
  }

  return {
    stepUpAuthDecision: {
      stepUpAuthDecisionId: `step-up:${deviceTrustDecision?.deviceTrustDecisionId ?? "unknown"}`,
      decision,
      riskLevel: highRiskDevice || suspicious ? "high" : degradedPosture || authFailures >= 3 ? "medium" : "low",
      challengeType: decision === "required" ? "reauthenticate-owner" : "none",
      checks: [
        `device:${normalizeString(deviceTrustDecision?.decision, "unknown")}`,
        suspicious ? "suspicious-activity" : null,
        authFailures >= 3 ? "auth-failure-threshold" : null,
      ].filter(Boolean),
      reason,
    },
  };
}
