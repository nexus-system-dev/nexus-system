function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeBoolean(value, fallback = false) {
  return typeof value === "boolean" ? value : fallback;
}

function resolveNow(sessionState = {}) {
  const explicitNow = sessionState.now ?? sessionState.currentTimestamp;
  const parsed = typeof explicitNow === "string" || Number.isFinite(explicitNow)
    ? new Date(explicitNow).getTime()
    : NaN;
  return Number.isFinite(parsed) ? parsed : Date.now();
}

function hasExpiredSession(sessionState = {}, nowMs) {
  const expiresAt = normalizeString(sessionState.expiresAt, null);
  if (!expiresAt) {
    return false;
  }

  const expiresAtMs = new Date(expiresAt).getTime();
  return Number.isFinite(expiresAtMs) && expiresAtMs <= nowMs;
}

function requiresRotation(sessionState = {}, nowMs) {
  const issuedAt = normalizeString(sessionState.issuedAt, null);
  if (!issuedAt) {
    return false;
  }

  const issuedAtMs = new Date(issuedAt).getTime();
  if (!Number.isFinite(issuedAtMs)) {
    return false;
  }

  const maxAgeMs = 8 * 60 * 60 * 1000;
  return (nowMs - issuedAtMs) >= maxAgeMs;
}

export function createSessionSecurityControls({
  sessionState = null,
  securitySignals = null,
} = {}) {
  const normalizedSessionState = normalizeObject(sessionState);
  const normalizedSecuritySignals = normalizeObject(securitySignals);
  const nowMs = resolveNow(normalizedSessionState);

  if (normalizeBoolean(normalizedSessionState.isRevoked, false)) {
    return {
      sessionSecurityDecision: {
        decision: "invalidated",
        isBlocked: true,
        requiresRotation: false,
        reason: "Session was revoked",
        triggeredControls: ["revoke-check"],
      },
    };
  }

  if (hasExpiredSession(normalizedSessionState, nowMs)) {
    return {
      sessionSecurityDecision: {
        decision: "expired",
        isBlocked: true,
        requiresRotation: false,
        reason: "Session expired",
        triggeredControls: ["expiry-check"],
      },
    };
  }

  if (normalizeBoolean(normalizedSecuritySignals.suspiciousActivity, false)) {
    return {
      sessionSecurityDecision: {
        decision: "suspicious",
        isBlocked: true,
        requiresRotation: false,
        reason: "Suspicious session activity detected",
        triggeredControls: [
          "suspicious-activity-check",
          normalizedSecuritySignals.burstDetected ? "burst-detected" : null,
          normalizedSecuritySignals.routeScanningDetected ? "route-scanning-detected" : null,
          normalizedSecuritySignals.authFailures >= 3 ? "auth-failure-threshold" : null,
        ].filter(Boolean),
      },
    };
  }

  if (requiresRotation(normalizedSessionState, nowMs)) {
    return {
      sessionSecurityDecision: {
        decision: "rotation-required",
        isBlocked: false,
        requiresRotation: true,
        reason: "Session age exceeded rotation threshold",
        triggeredControls: ["rotation-window-check"],
      },
    };
  }

  return {
    sessionSecurityDecision: {
      decision: "valid",
      isBlocked: false,
      requiresRotation: false,
      reason: "Session passed security checks",
      triggeredControls: [],
    },
  };
}
