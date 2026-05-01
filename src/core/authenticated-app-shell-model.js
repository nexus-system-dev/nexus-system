function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function resolveShellStage({ authenticationState, projectCreationExperience, onboardingViewState, workspaceNavigationModel }) {
  if (authenticationState.isAuthenticated !== true) {
    return "authentication";
  }
  if (projectCreationExperience.postLoginDestination === "project-creation") {
    return "project-creation";
  }
  if (onboardingViewState.summary?.needsUserInput === true || onboardingViewState.activeScreen) {
    return "onboarding";
  }
  if (normalizeArray(workspaceNavigationModel.availableWorkspaces).length > 0) {
    return "workspace";
  }
  return "project-creation";
}

export function createAuthenticatedAppShellModel({
  nexusAppShellSchema = null,
  authenticationState = null,
  postAuthRedirect = null,
  projectCreationExperience = null,
  onboardingViewState = null,
  workspaceNavigationModel = null,
  userIdentity = null,
} = {}) {
  const normalizedSchema = normalizeObject(nexusAppShellSchema);
  const normalizedAuth = normalizeObject(authenticationState);
  const normalizedRedirect = normalizeObject(postAuthRedirect);
  const normalizedProjectCreation = normalizeObject(projectCreationExperience);
  const normalizedOnboarding = normalizeObject(onboardingViewState);
  const normalizedWorkspaceNavigation = normalizeObject(workspaceNavigationModel);
  const normalizedUser = normalizeObject(userIdentity);
  const shellStage = resolveShellStage({
    authenticationState: normalizedAuth,
    projectCreationExperience: normalizedProjectCreation,
    onboardingViewState: normalizedOnboarding,
    workspaceNavigationModel: normalizedWorkspaceNavigation,
  });
  const currentWorkspace = normalizedWorkspaceNavigation.currentWorkspace ?? null;

  return {
    authenticatedAppShell: {
      authenticatedAppShellId: `authenticated-app-shell:${normalizedWorkspaceNavigation.projectId ?? normalizedUser.userId ?? "anonymous"}`,
      status: normalizedAuth.isAuthenticated === true ? "ready" : "blocked",
      shellStage,
      activeRouteKey:
        shellStage === "workspace"
          ? "workspace-home"
          : shellStage === "project-creation"
            ? "project-creation"
            : shellStage,
      redirectTarget: normalizedRedirect.destination ?? null,
      actor: {
        userId: normalizedUser.userId ?? null,
        displayName: normalizedUser.displayName ?? null,
      },
      workspaceContext: {
        projectId: normalizedWorkspaceNavigation.projectId ?? null,
        currentWorkspaceKey: currentWorkspace?.key ?? null,
        currentWorkspaceLabel: currentWorkspace?.label ?? null,
        availableWorkspaceCount: normalizeArray(normalizedWorkspaceNavigation.availableWorkspaces).length,
      },
      shellChrome: {
        showsNavigation: normalizedAuth.isAuthenticated === true,
        showsStatusStrip: shellStage === "workspace",
        showsCompanionDock: shellStage === "workspace",
      },
      routeRegistry: normalizeArray(normalizedSchema.routeRegistry),
      summary: {
        canEnterWorkspace: shellStage === "workspace",
        needsProjectCreation: shellStage === "project-creation",
        needsOnboarding: shellStage === "onboarding",
      },
    },
  };
}
