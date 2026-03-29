function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function createScreenState({ enabled, reason = null, emphasis = "default", nextAction = null } = {}) {
  return {
    enabled,
    reason,
    emphasis,
    nextAction,
  };
}

function resolveActiveScreen(authenticationRouteDecision) {
  switch (authenticationRouteDecision.route) {
    case "signup":
      return "signup";
    case "session-restore":
      return "session-restore";
    case "session-expired":
      return "session-expired";
    case "workspace":
      return "logout-redirect";
    case "login":
    default:
      return "login";
  }
}

function buildScreenStates(activeScreen, authenticationRouteDecision, verificationFlowState) {
  const verificationStatus = verificationFlowState.status ?? "idle";
  const hasVerificationIssue = verificationStatus === "expired" || verificationStatus === "unavailable";

  return {
    signup: createScreenState({
      enabled: activeScreen === "signup",
      reason: activeScreen === "signup" ? authenticationRouteDecision.reason : null,
      emphasis: activeScreen === "signup" ? "primary" : "secondary",
      nextAction: activeScreen === "signup" ? "complete-signup" : null,
    }),
    login: createScreenState({
      enabled: activeScreen === "login",
      reason: activeScreen === "login" ? authenticationRouteDecision.reason : null,
      emphasis: activeScreen === "login" ? "primary" : "secondary",
      nextAction: activeScreen === "login" ? "login" : null,
    }),
    restoreSession: createScreenState({
      enabled: activeScreen === "session-restore",
      reason: activeScreen === "session-restore" ? authenticationRouteDecision.reason : null,
      emphasis: activeScreen === "session-restore" ? "primary" : "secondary",
      nextAction: activeScreen === "session-restore" ? "restore-session" : null,
    }),
    error: createScreenState({
      enabled: activeScreen === "session-expired" || hasVerificationIssue,
      reason:
        activeScreen === "session-expired"
          ? authenticationRouteDecision.reason
          : (hasVerificationIssue ? verificationStatus : null),
      emphasis: "critical",
      nextAction:
        activeScreen === "session-expired"
          ? "login"
          : (hasVerificationIssue ? verificationFlowState.nextActions?.[0] ?? null : null),
    }),
    loading: createScreenState({
      enabled: activeScreen === "session-restore",
      reason: activeScreen === "session-restore" ? "restoring-session" : null,
      emphasis: "informational",
      nextAction: activeScreen === "session-restore" ? "restore-session" : null,
    }),
    logoutRedirect: createScreenState({
      enabled: activeScreen === "logout-redirect",
      reason: activeScreen === "logout-redirect" ? authenticationRouteDecision.reason : null,
      emphasis: "informational",
      nextAction: activeScreen === "logout-redirect" ? "open-workspace" : null,
    }),
  };
}

function buildSummary(activeScreen, screenStates, authenticationRouteDecision, verificationFlowState) {
  return {
    activeScreen,
    needsUserInput: screenStates.loading.enabled !== true && screenStates.logoutRedirect.enabled !== true,
    hasBlockingError: screenStates.error.enabled,
    verificationStatus: verificationFlowState.status ?? "idle",
    nextAction:
      screenStates.error.enabled
        ? screenStates.error.nextAction
        : (authenticationRouteDecision.nextAction ?? null),
  };
}

export function buildAuthenticationScreenStates({
  authenticationRouteDecision = null,
  verificationFlowState = null,
} = {}) {
  const normalizedRouteDecision = normalizeObject(authenticationRouteDecision);
  const normalizedVerificationFlow = normalizeObject(verificationFlowState);
  const activeScreen = resolveActiveScreen(normalizedRouteDecision);
  const screens = buildScreenStates(activeScreen, normalizedRouteDecision, normalizedVerificationFlow);

  return {
    authenticationViewState: {
      viewStateId: `authentication-view:${normalizedRouteDecision.decisionId ?? "anonymous"}`,
      activeScreen,
      screens,
      summary: buildSummary(activeScreen, screens, normalizedRouteDecision, normalizedVerificationFlow),
    },
  };
}
