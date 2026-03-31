function normalizeRequestContext(requestContext) {
  return requestContext && typeof requestContext === "object" ? requestContext : {};
}

function normalizeSessionState(sessionState) {
  return sessionState && typeof sessionState === "object" ? sessionState : {};
}

function normalizeAuthenticationState(authenticationState) {
  return authenticationState && typeof authenticationState === "object" ? authenticationState : {};
}

function normalizeAccessDecision(accessDecision) {
  return accessDecision && typeof accessDecision === "object" ? accessDecision : {};
}

function normalizeSessionSecurityDecision(sessionSecurityDecision) {
  return sessionSecurityDecision && typeof sessionSecurityDecision === "object" ? sessionSecurityDecision : {};
}

export function createAuthMiddleware({
  requestContext = null,
  sessionState = null,
  authenticationState = null,
  accessDecision = null,
  sessionSecurityDecision = null,
} = {}) {
  const normalizedRequestContext = normalizeRequestContext(requestContext);
  const normalizedSessionState = normalizeSessionState(sessionState);
  const normalizedAuthenticationState = normalizeAuthenticationState(authenticationState);
  const normalizedAccessDecision = normalizeAccessDecision(accessDecision);
  const normalizedSessionSecurityDecision = normalizeSessionSecurityDecision(sessionSecurityDecision);

  const hasValidSession =
    normalizedSessionState.status === "active"
    && normalizedSessionState.isRevoked !== true
    && normalizedSessionSecurityDecision.isBlocked !== true;
  const isAuthenticated = normalizedAuthenticationState.isAuthenticated === true && hasValidSession;
  const workspaceAccess = normalizedAccessDecision.canView === true;
  const decision = !isAuthenticated
    ? "unauthenticated"
    : !workspaceAccess
      ? "forbidden"
      : "authenticated";

  return {
    authenticatedRequest: {
      requestId: normalizedRequestContext.requestId ?? `request-${Date.now()}`,
      projectId: normalizedRequestContext.projectId ?? null,
      userId: normalizedSessionState.userId ?? normalizedAuthenticationState.userId ?? null,
      sessionId: normalizedSessionState.sessionId ?? null,
      authStatus: decision,
      isAuthenticated,
      hasWorkspaceAccess: workspaceAccess,
      effectiveRole: normalizedAccessDecision.effectiveRole ?? null,
      allowedActions: normalizedAccessDecision.allowedActions ?? [],
      reason: decision === "authenticated"
        ? "Request is authenticated and has workspace access"
        : decision === "forbidden"
          ? normalizedAccessDecision.reason ?? "Workspace access denied"
          : normalizedSessionSecurityDecision.isBlocked === true
            ? normalizedSessionSecurityDecision.reason ?? "Session failed security controls"
          : "Session is missing or inactive",
    },
  };
}
