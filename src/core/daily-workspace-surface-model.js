function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createDailyWorkspaceSurfaceModel({
  authenticatedAppShell = null,
  navigationRouteSurface = null,
  developerWorkspace = null,
  projectBrainWorkspace = null,
  releaseWorkspace = null,
  growthWorkspace = null,
  capabilityDecision = null,
} = {}) {
  const shell = normalizeObject(authenticatedAppShell);
  const navigation = normalizeObject(navigationRouteSurface);
  const capability = normalizeObject(capabilityDecision);
  const workspaces = {
    developer: normalizeObject(developerWorkspace),
    "project-brain": normalizeObject(projectBrainWorkspace),
    release: normalizeObject(releaseWorkspace),
    growth: normalizeObject(growthWorkspace),
  };
  const activeKey = navigation.handoffContext?.currentWorkspace ?? "project-brain";
  const activeWorkspace = workspaces[activeKey] ?? workspaces["project-brain"];

  return {
    dailyWorkspaceSurface: {
      dailyWorkspaceSurfaceId: `daily-workspace:${shell.workspaceContext?.projectId ?? "anonymous"}`,
      status: shell.status === "ready" ? "ready" : "blocked",
      activeWorkspaceKey: activeKey,
      activeWorkspace,
      capabilityDecision: capability.decision ?? "unknown",
      sections: {
        developer: workspaces.developer,
        projectBrain: workspaces["project-brain"],
        release: workspaces.release,
        growth: workspaces.growth,
      },
      summary: {
        supportsWorkspaceExecution: shell.summary?.canEnterWorkspace === true,
        activeWorkspaceTitle: activeWorkspace.workspaceId ?? activeKey,
      },
    },
  };
}
