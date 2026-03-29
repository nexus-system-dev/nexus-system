function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function hasWorkspace(workspaceModel) {
  return typeof workspaceModel.workspaceId === "string" && workspaceModel.workspaceId.length > 0;
}

function resolveDestination(authenticationRouteDecision, sessionState, workspaceModel) {
  if (authenticationRouteDecision.route !== "workspace") {
    return {
      destination: "authentication",
      reason: "authentication-incomplete",
      requiresRedirect: false,
    };
  }

  if (
    workspaceModel.status === "waitlist"
    || sessionState.status === "waitlist"
    || sessionState.waitlistStatus === "pending"
  ) {
    return {
      destination: "waitlist-status",
      reason: "workspace-waitlist",
      requiresRedirect: true,
    };
  }

  if (
    sessionState.pendingApprovalCount > 0
    || sessionState.nextDestination === "approval-inbox"
    || sessionState.requiresApproval === true
  ) {
    return {
      destination: "approval-inbox",
      reason: "pending-approvals",
      requiresRedirect: true,
    };
  }

  if (
    sessionState.resumeOnboarding === true
    || sessionState.nextDestination === "onboarding-resume"
    || workspaceModel.onboardingStatus === "in-progress"
  ) {
    return {
      destination: "onboarding-resume",
      reason: "onboarding-incomplete",
      requiresRedirect: true,
    };
  }

  if (!hasWorkspace(workspaceModel) || workspaceModel.status === "draft") {
    return {
      destination: "project-creation",
      reason: "workspace-not-ready",
      requiresRedirect: true,
    };
  }

  return {
    destination: "workbench",
    reason: "workspace-ready",
    requiresRedirect: true,
  };
}

function buildAvailableDestinations(sessionState, workspaceModel) {
  return [
    "project-creation",
    sessionState.resumeOnboarding === true || workspaceModel.onboardingStatus === "in-progress"
      ? "onboarding-resume"
      : null,
    "workbench",
    sessionState.pendingApprovalCount > 0 || sessionState.requiresApproval === true
      ? "approval-inbox"
      : null,
    workspaceModel.status === "waitlist" || sessionState.waitlistStatus === "pending"
      ? "waitlist-status"
      : null,
  ].filter(Boolean);
}

export function createPostAuthRedirectResolver({
  authenticationRouteDecision = null,
  sessionState = null,
  workspaceModel = null,
} = {}) {
  const normalizedRouteDecision = normalizeObject(authenticationRouteDecision);
  const normalizedSessionState = normalizeObject(sessionState);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const resolvedDestination = resolveDestination(
    normalizedRouteDecision,
    normalizedSessionState,
    normalizedWorkspaceModel,
  );

  return {
    postAuthRedirect: {
      redirectId: `post-auth-redirect:${normalizedSessionState.userId ?? normalizedWorkspaceModel.ownerUserId ?? "anonymous"}`,
      destination: resolvedDestination.destination,
      reason: resolvedDestination.reason,
      requiresRedirect: resolvedDestination.requiresRedirect,
      availableDestinations: buildAvailableDestinations(
        normalizedSessionState,
        normalizedWorkspaceModel,
      ),
      summary: {
        hasWorkspace: hasWorkspace(normalizedWorkspaceModel),
        resumesOnboarding: resolvedDestination.destination === "onboarding-resume",
        entersWorkbench: resolvedDestination.destination === "workbench",
        waitsForApproval: resolvedDestination.destination === "approval-inbox",
      },
    },
  };
}
