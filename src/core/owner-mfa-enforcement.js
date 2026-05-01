function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function resolveTrigger({
  ownerAuthState = null,
  authenticationState = null,
  requestContext = null,
} = {}) {
  if (ownerAuthState?.isOwner !== true) {
    return null;
  }

  if (
    normalizeBoolean(requestContext?.isCriticalAction, false)
    || normalizeString(requestContext?.actionSensitivity, "").toLowerCase() === "critical"
  ) {
    return "critical-action";
  }

  if (
    normalizeBoolean(requestContext?.privilegedMode, false)
    || normalizeBoolean(requestContext?.requiresPrivilegedMode, false)
  ) {
    return "privileged-mode";
  }

  if (authenticationState?.isAuthenticated === true) {
    return "login";
  }

  return null;
}

export function createOwnerMfaEnforcement({
  ownerAuthState = null,
  authenticationState = null,
  sessionSecurityDecision = null,
  requestContext = null,
} = {}) {
  const trigger = resolveTrigger({ ownerAuthState, authenticationState, requestContext });
  const hasEnrollment = ownerAuthState?.hasMfa === true || authenticationState?.authMetadata?.hasMfa === true;
  const sessionBlocked = sessionSecurityDecision?.isBlocked === true;

  let decision = "not-required";
  let reason = "MFA is not required for this context";
  let requiresEnrollment = false;
  let requiresChallenge = false;
  let canProceed = true;

  if (ownerAuthState?.isOwner === true) {
    if (sessionBlocked) {
      decision = "blocked";
      reason = sessionSecurityDecision?.reason ?? "Session security blocked owner access";
      canProceed = false;
    } else if (trigger && !hasEnrollment) {
      decision = "required";
      reason = "Owner access requires MFA enrollment";
      requiresEnrollment = true;
      canProceed = false;
    } else if (trigger === "privileged-mode" || trigger === "critical-action") {
      decision = "challenge-required";
      reason = "Owner action requires an MFA challenge";
      requiresChallenge = true;
      canProceed = false;
    } else if (trigger === "login" && hasEnrollment) {
      decision = "satisfied";
      reason = "Owner login meets MFA enforcement requirements";
    }
  }

  return {
    ownerMfaDecision: {
      ownerMfaDecisionId: `owner-mfa:${ownerAuthState?.userId ?? authenticationState?.userId ?? "anonymous"}`,
      decision,
      trigger: trigger ?? "none",
      isOwnerScope: ownerAuthState?.isOwner === true,
      hasEnrollment,
      requiresEnrollment,
      requiresChallenge,
      canProceed,
      checks: [
        ownerAuthState?.isOwner === true ? "owner-scope" : "non-owner",
        trigger ? `trigger:${trigger}` : "trigger:none",
        hasEnrollment ? "mfa-enrolled" : "mfa-not-enrolled",
        sessionBlocked ? "session-blocked" : "session-valid",
      ],
      reason,
      summary: {
        enforcementActive: ownerAuthState?.isOwner === true && trigger !== null,
        blockedBySecurity: sessionBlocked,
        challengeRequired: requiresChallenge,
      },
    },
  };
}
