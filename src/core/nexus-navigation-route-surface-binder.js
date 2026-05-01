function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildWorkspaceTabs(workspaceNavigationModel) {
  return normalizeArray(workspaceNavigationModel.availableWorkspaces).map((workspace) => ({
    tabId: `tab:${workspace.key}`,
    label: workspace.label,
    route: workspace.route,
    workspaceId: workspace.workspaceId,
    isActive: workspace.key === workspaceNavigationModel.currentWorkspace?.key,
  }));
}

export function createNexusNavigationAndRouteSurfaceBinder({
  nexusAppShellSchema = null,
  authenticatedAppShell = null,
  workspaceNavigationModel = null,
  navigationComponents = null,
} = {}) {
  const normalizedSchema = normalizeObject(nexusAppShellSchema);
  const normalizedShell = normalizeObject(authenticatedAppShell);
  const normalizedWorkspaceNavigation = normalizeObject(workspaceNavigationModel);
  const normalizedNavigationComponents = normalizeObject(navigationComponents);
  const activeRoute =
    normalizeArray(normalizedSchema.routeRegistry).find((route) => route.routeKey === normalizedShell.activeRouteKey)
    ?? normalizeArray(normalizedSchema.routeRegistry).find((route) => route.routeKey === normalizedSchema.defaultAuthenticatedRoute)
    ?? null;
  const workspaceTabs = buildWorkspaceTabs(normalizedWorkspaceNavigation);

  return {
    navigationRouteSurface: {
      navigationRouteSurfaceId: `navigation-surface:${normalizedWorkspaceNavigation.projectId ?? "anonymous"}`,
      status: activeRoute ? "ready" : "missing-inputs",
      activeRoute,
      workspaceTabs,
      routeBindings: normalizeArray(normalizedSchema.routeRegistry).map((route) => ({
        routeKey: route.routeKey,
        path: route.path,
        enabled: route.enabled,
        surfaceType: route.routeKey.includes("workspace") || route.routeKey === "workspace-home" ? "workspace" : "screen",
      })),
      componentBindings: {
        navigationComponentLibraryId: normalizedNavigationComponents.navigationComponentLibraryId ?? null,
        totalComponents: normalizeArray(normalizedNavigationComponents.components).length,
      },
      handoffContext: normalizedWorkspaceNavigation.handoffContext ?? null,
      summary: {
        supportsWorkspaceTabs: workspaceTabs.length > 0,
        activeRouteKey: activeRoute?.routeKey ?? null,
      },
    },
  };
}
