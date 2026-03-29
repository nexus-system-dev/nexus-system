function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function resolveRoute(authenticationState, sessionState) {
  const normalizedAuth = normalizeObject(authenticationState);
  const normalizedSession = normalizeObject(sessionState);

  if (normalizedAuth.status === "logged-out") {
    return {
      route: "login",
      reason: "logged-out-session",
      nextAction: "login",
      isRedirect: false,
    };
  }

  if (normalizedSession.status === "active" && normalizedSession.isRevoked === true) {
    return {
      route: "session-expired",
      reason: "revoked-session",
      nextAction: "restore-session",
      isRedirect: false,
    };
  }

  if (normalizedAuth.isAuthenticated === true && normalizedSession.status === "active") {
    return {
      route: "workspace",
      reason: "active-authenticated-session",
      nextAction: "open-workspace",
      isRedirect: true,
    };
  }

  if (normalizedAuth.status === "authenticated" && normalizedSession.status !== "active") {
    return {
      route: "session-restore",
      reason: "missing-active-session",
      nextAction: "restore-session",
      isRedirect: false,
    };
  }

  if (normalizedAuth.status === "identified") {
    return {
      route: "signup",
      reason: "identified-user-needs-auth",
      nextAction: "complete-signup",
      isRedirect: false,
    };
  }

  return {
    route: "login",
    reason: "anonymous-entry",
    nextAction: "login",
    isRedirect: false,
  };
}

function buildAvailableRoutes(authenticationState, sessionState, resolvedRoute) {
  const normalizedAuth = normalizeObject(authenticationState);
  const normalizedSession = normalizeObject(sessionState);

  return [
    "signup",
    "login",
    normalizedAuth.status === "authenticated" && normalizedSession.status !== "active" ? "session-restore" : null,
    normalizedAuth.status === "logged-out" || normalizedSession.isRevoked === true ? "session-expired" : null,
    resolvedRoute.route === "workspace" ? "workspace" : null,
  ].filter(Boolean);
}

export function createAuthenticationRouteResolver({
  authenticationState = null,
  sessionState = null,
} = {}) {
  const normalizedAuth = normalizeObject(authenticationState);
  const normalizedSession = normalizeObject(sessionState);
  const resolvedRoute = resolveRoute(normalizedAuth, normalizedSession);

  return {
    authenticationRouteDecision: {
      decisionId: `authentication-route:${normalizedAuth.userId ?? normalizedSession.userId ?? "anonymous"}`,
      route: resolvedRoute.route,
      reason: resolvedRoute.reason,
      nextAction: resolvedRoute.nextAction,
      isRedirect: resolvedRoute.isRedirect,
      availableRoutes: buildAvailableRoutes(normalizedAuth, normalizedSession, resolvedRoute),
      summary: {
        requiresAuthentication: resolvedRoute.route !== "workspace",
        hasActiveSession: normalizedSession.status === "active" && normalizedSession.isRevoked !== true,
        canEnterWorkspaceDirectly: resolvedRoute.route === "workspace",
      },
    },
  };
}
