function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildRouteRegistry({ authenticationViewState, projectCreationExperience, onboardingViewState, workspaceNavigationModel, boundaryDisclosureModel }) {
  const disclosures = normalizeArray(boundaryDisclosureModel.disclosureCards);
  const availableWorkspaces = normalizeArray(workspaceNavigationModel.availableWorkspaces);
  const onboardingNeedsInput = onboardingViewState.summary?.needsUserInput === true;
  const workspaceAvailable = availableWorkspaces.length > 0;
  const canCreateProject = projectCreationExperience.validation?.canCreateDraft === true;

  return [
    {
      routeKey: "authentication",
      path: "/auth",
      gate: "unauthenticated",
      enabled: authenticationViewState.summary?.needsUserInput === true || authenticationViewState.activeScreen === "login",
    },
    {
      routeKey: "project-creation",
      path: "/create-project",
      gate: "authenticated",
      enabled: canCreateProject,
    },
    {
      routeKey: "onboarding",
      path: "/onboarding",
      gate: "authenticated",
      enabled: onboardingNeedsInput || onboardingViewState.status === "ready",
    },
    {
      routeKey: "workspace-home",
      path: "/home",
      gate: "authenticated",
      enabled: workspaceAvailable,
    },
    ...availableWorkspaces.map((workspace) => ({
      routeKey: workspace.key,
      path: workspace.route,
      gate: "authenticated",
      enabled: workspace.isAvailable === true,
    })),
    {
      routeKey: "settings",
      path: "/settings",
      gate: "authenticated",
      enabled: true,
    },
    {
      routeKey: "ai-control-center",
      path: "/ai-control-center",
      gate: "authenticated",
      enabled: disclosures.length > 0 || workspaceAvailable,
    },
  ];
}

export function defineNexusAppShellSchema({
  authenticationViewState = null,
  postAuthRedirect = null,
  projectCreationExperience = null,
  onboardingViewState = null,
  workspaceNavigationModel = null,
  screenInventory = null,
  boundaryDisclosureModel = null,
} = {}) {
  const normalizedAuth = normalizeObject(authenticationViewState);
  const normalizedRedirect = normalizeObject(postAuthRedirect);
  const normalizedProjectCreation = normalizeObject(projectCreationExperience);
  const normalizedOnboarding = normalizeObject(onboardingViewState);
  const normalizedWorkspaceNavigation = normalizeObject(workspaceNavigationModel);
  const normalizedScreenInventory = normalizeObject(screenInventory);
  const normalizedBoundaryDisclosure = normalizeObject(boundaryDisclosureModel);
  const routeRegistry = buildRouteRegistry({
    authenticationViewState: normalizedAuth,
    projectCreationExperience: normalizedProjectCreation,
    onboardingViewState: normalizedOnboarding,
    workspaceNavigationModel: normalizedWorkspaceNavigation,
    boundaryDisclosureModel: normalizedBoundaryDisclosure,
  });

  return {
    nexusAppShellSchema: {
      nexusAppShellSchemaId: `nexus-app-shell-schema:${normalizedWorkspaceNavigation.projectId ?? "anonymous"}`,
      status: routeRegistry.some((route) => route.enabled) ? "ready" : "missing-inputs",
      shellModes: ["authentication", "project-creation", "onboarding", "workspace", "settings"],
      defaultAuthenticatedRoute:
        normalizedRedirect.destination === "workbench"
          ? "workspace-home"
          : normalizedRedirect.destination ?? "workspace-home",
      routeRegistry,
      primaryShellSurfaces: ["topbar", "navigation-rail", "hero-header", "main-content", "status-strip"],
      screenCoverage: {
        totalScreens: normalizeArray(normalizedScreenInventory.screens).length,
        screenTypes: normalizeArray(normalizedScreenInventory.summary?.screenTypes),
      },
      disclosureCoverage: {
        totalDisclosures: normalizeArray(normalizedBoundaryDisclosure.disclosureCards).length,
        supportsExpectationGuidance: normalizeArray(normalizedBoundaryDisclosure.disclosureCards).length > 0,
      },
      summary: {
        supportsAuthenticatedHome: routeRegistry.some((route) => route.routeKey === "workspace-home" && route.enabled),
        supportsOnboardingResume: routeRegistry.some((route) => route.routeKey === "onboarding" && route.enabled),
        supportsProjectCreation: routeRegistry.some((route) => route.routeKey === "project-creation" && route.enabled),
      },
    },
  };
}
