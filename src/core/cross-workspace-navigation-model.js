function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function buildWorkspaceEntry({ key, label, workspace, route, contextProjectId, isDefault = false }) {
  const normalizedWorkspace = normalizeObject(workspace);
  const workspaceId = normalizedWorkspace.workspaceId ?? null;

  return {
    key,
    label,
    route,
    workspaceId,
    projectId:
      normalizedWorkspace.overview?.projectId
      ?? normalizedWorkspace.projectId
      ?? contextProjectId
      ?? null,
    isAvailable: Boolean(workspaceId),
    isDefault,
  };
}

function inferNextAction({ projectBrainWorkspace, projectExplanation, activeBottleneck }) {
  return projectExplanation?.nextAction?.selectedAction
    ?? projectBrainWorkspace?.overview?.nextAction
    ?? activeBottleneck?.reason
    ?? null;
}

function inferReleaseStatus({ releaseWorkspace, releaseStatus, activeBottleneck }) {
  if (activeBottleneck?.blockerType === "release-blocker") {
    return "blocked";
  }

  return releaseStatus?.status
    ?? releaseWorkspace?.validation?.status
    ?? releaseWorkspace?.buildAndDeploy?.currentStatus
    ?? null;
}

export function createCrossWorkspaceNavigationModel({
  projectBrainWorkspace = null,
  developmentWorkspace = null,
  releaseWorkspace = null,
  growthWorkspace = null,
  projectExplanation = null,
  activeBottleneck = null,
  releaseStatus = null,
} = {}) {
  const normalizedProjectBrainWorkspace = normalizeObject(projectBrainWorkspace);
  const normalizedDevelopmentWorkspace = normalizeObject(developmentWorkspace);
  const normalizedReleaseWorkspace = normalizeObject(releaseWorkspace);
  const normalizedGrowthWorkspace = normalizeObject(growthWorkspace);
  const normalizedProjectExplanation = normalizeObject(projectExplanation);
  const normalizedActiveBottleneck = normalizeObject(activeBottleneck);
  const normalizedReleaseStatus = normalizeObject(releaseStatus);

  const contextProjectId = normalizedProjectBrainWorkspace.overview?.projectId ?? null;

  const workspaces = [
    buildWorkspaceEntry({
      key: "project-brain",
      label: "Project Brain",
      workspace: normalizedProjectBrainWorkspace,
      route: "/project-brain",
      contextProjectId,
      isDefault: true,
    }),
    buildWorkspaceEntry({
      key: "development",
      label: "Development",
      workspace: normalizedDevelopmentWorkspace,
      route: "/development",
      contextProjectId,
    }),
    buildWorkspaceEntry({
      key: "release",
      label: "Release",
      workspace: normalizedReleaseWorkspace,
      route: "/release",
      contextProjectId,
    }),
    buildWorkspaceEntry({
      key: "growth",
      label: "Growth",
      workspace: normalizedGrowthWorkspace,
      route: "/growth",
      contextProjectId,
    }),
  ];

  const availableWorkspaces = workspaces.filter((workspace) => workspace.isAvailable);
  const currentWorkspace = availableWorkspaces.find((workspace) => workspace.isDefault) ?? availableWorkspaces[0] ?? null;

  return {
    workspaceNavigationModel: {
      projectId: contextProjectId,
      currentWorkspace,
      availableWorkspaces,
      routes: workspaces.map((workspace) => ({
        key: workspace.key,
        route: workspace.route,
        workspaceId: workspace.workspaceId,
      })),
      handoffContext: {
        projectId: contextProjectId,
        currentWorkspace: currentWorkspace?.key ?? null,
        nextAction: inferNextAction({
          projectBrainWorkspace: normalizedProjectBrainWorkspace,
          projectExplanation: normalizedProjectExplanation,
          activeBottleneck: normalizedActiveBottleneck,
        }),
        activeFilePath: normalizedDevelopmentWorkspace.codeSurface?.editor?.activeFilePath ?? null,
        releaseStatus: inferReleaseStatus({
          releaseWorkspace: normalizedReleaseWorkspace,
          releaseStatus: normalizedReleaseStatus,
          activeBottleneck: normalizedActiveBottleneck,
        }),
        growthFocus: normalizedGrowthWorkspace.strategy?.contentGoal ?? null,
        blockerType: normalizedActiveBottleneck.blockerType ?? null,
        resumeToken: contextProjectId && currentWorkspace?.key
          ? `resume:${contextProjectId}:${currentWorkspace.key}:${normalizedActiveBottleneck.blockerType ?? "none"}`
          : null,
      },
      summary: {
        totalWorkspaces: availableWorkspaces.length,
        hasProjectBrain: Boolean(normalizedProjectBrainWorkspace.workspaceId),
        hasDevelopment: Boolean(normalizedDevelopmentWorkspace.workspaceId),
        hasRelease: Boolean(normalizedReleaseWorkspace.workspaceId),
        hasGrowth: Boolean(normalizedGrowthWorkspace.workspaceId),
        headline: contextProjectId
          ? `Workspace continuity is ready for ${contextProjectId}`
          : "Workspace continuity is not initialized",
      },
    },
  };
}
