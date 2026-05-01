function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(landingAuthHandoff, authenticationState, sessionState) {
  const missingInputs = [];
  if (!landingAuthHandoff || normalizeString(landingAuthHandoff.status) !== "ready") {
    missingInputs.push("landingAuthHandoff");
  }
  if (!authenticationState || normalizeString(authenticationState.status) === null) {
    missingInputs.push("authenticationState");
  }
  if (!sessionState || normalizeString(sessionState.status) === null) {
    missingInputs.push("sessionState");
  }
  return missingInputs;
}

function resolveDecision({ landingAuthHandoff, authenticationState, sessionState }) {
  if (authenticationState?.isAuthenticated === true && sessionState?.status === "active") {
    return { decision: "direct-app", destination: "/app" };
  }
  if (landingAuthHandoff?.mode === "waitlist") {
    return { decision: "waitlist-state", destination: "/waitlist" };
  }
  if (landingAuthHandoff?.mode === "request-access") {
    return { decision: "access-gate", destination: "/request-access" };
  }
  return { decision: "auth-gate", destination: landingAuthHandoff?.destinationRoute ?? "/signup" };
}

export function createAppEntryGateResolver({
  landingAuthHandoff = null,
  authenticationState = null,
  sessionState = null,
} = {}) {
  const normalizedHandoff = normalizeObject(landingAuthHandoff);
  const normalizedAuth = normalizeObject(authenticationState);
  const normalizedSession = normalizeObject(sessionState);
  const missingInputs = buildMissingInputs(normalizedHandoff, normalizedAuth, normalizedSession);

  if (missingInputs.length > 0) {
    return {
      appEntryDecision: {
        appEntryDecisionId: `app-entry:${slugify(normalizedHandoff?.landingAuthHandoffId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const decision = resolveDecision({
    landingAuthHandoff: normalizedHandoff,
    authenticationState: normalizedAuth,
    sessionState: normalizedSession,
  });

  return {
    appEntryDecision: {
      appEntryDecisionId: `app-entry:${slugify(normalizedHandoff.landingAuthHandoffId)}`,
      status: "ready",
      missingInputs: [],
      decision: decision.decision,
      destination: decision.destination,
      requiresAuthentication: decision.decision !== "direct-app",
    },
  };
}
