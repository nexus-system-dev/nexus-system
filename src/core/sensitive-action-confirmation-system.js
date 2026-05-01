function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

export function createSensitiveActionConfirmationSystem({
  ownerMfaDecision = null,
  privilegedAuthorityDecision = null,
} = {}) {
  const isPrivilegedAction = privilegedAuthorityDecision?.isPrivilegedAction === true;
  const triggerAction = normalizeString(privilegedAuthorityDecision?.projectAction, "owner-action");

  let decision = "not-required";
  let reason = "No sensitive action confirmation required";

  if (ownerMfaDecision?.decision === "blocked") {
    decision = "blocked";
    reason = ownerMfaDecision.reason;
  } else if (isPrivilegedAction && ownerMfaDecision?.requiresEnrollment) {
    decision = "blocked";
    reason = "Sensitive action blocked until owner MFA is enrolled";
  } else if (isPrivilegedAction && ownerMfaDecision?.requiresChallenge) {
    decision = "pending-confirmation";
    reason = "Sensitive action requires an MFA-backed confirmation";
  } else if (isPrivilegedAction) {
    decision = "confirmed";
    reason = "Sensitive action confirmation is satisfied";
  }

  return {
    sensitiveActionConfirmation: {
      sensitiveActionConfirmationId: `sensitive-action:${triggerAction}`,
      decision,
      actionType: triggerAction,
      requiresConfirmation: decision === "pending-confirmation",
      isBlocked: decision === "blocked",
      confirmationMethods: ownerMfaDecision?.hasEnrollment ? ["mfa"] : [],
      checks: [
        isPrivilegedAction ? "privileged-action" : "standard-action",
        `mfa:${ownerMfaDecision?.decision ?? "not-required"}`,
      ],
      reason,
    },
  };
}
