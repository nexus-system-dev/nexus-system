function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function resolveWorkspaceMode(localDevelopmentBridge) {
  const connection = normalizeObject(localDevelopmentBridge.connection);
  if (connection.isConnected === true) {
    return "local-bridge-attached-workspace";
  }

  return "browser-backed-local-workspace";
}

export function createLocalWorkspaceContract({
  projectId = null,
  projectName = null,
  productClass = null,
  workspaceNavigationModel = null,
  splitWorkspaceLiveBuildSurfaceModel = null,
  returnTomorrowContinuity = null,
  localDevelopmentBridge = null,
  cloudWorkspaceModel = null,
  buildProgressionStateMachine = null,
} = {}) {
  const normalizedWorkspaceNavigationModel = normalizeObject(workspaceNavigationModel);
  const normalizedSplitWorkspaceModel = normalizeObject(splitWorkspaceLiveBuildSurfaceModel);
  const normalizedReturnTomorrowContinuity = normalizeObject(returnTomorrowContinuity);
  const normalizedLocalDevelopmentBridge = normalizeObject(localDevelopmentBridge);
  const normalizedCloudWorkspaceModel = normalizeObject(cloudWorkspaceModel);
  const normalizedBuildProgressionStateMachine = normalizeObject(buildProgressionStateMachine);

  const currentWorkspace = normalizeObject(normalizedWorkspaceNavigationModel.currentWorkspace);
  const handoffContext = normalizeObject(normalizedWorkspaceNavigationModel.handoffContext);
  const mode = resolveWorkspaceMode(normalizedLocalDevelopmentBridge);
  const resolvedProjectId =
    normalizeString(projectId)
    ?? normalizeString(normalizedWorkspaceNavigationModel.projectId)
    ?? normalizeString(currentWorkspace.projectId)
    ?? "unknown-project";
  const resumeWorkspace = normalizeString(
    normalizedReturnTomorrowContinuity.resumeWorkspace,
    normalizeString(handoffContext.currentWorkspace, currentWorkspace.key),
  );
  const resumeToken = normalizeString(
    normalizedReturnTomorrowContinuity.resumeToken,
    normalizeString(handoffContext.resumeToken),
  );
  const workspacePath = normalizeString(normalizedLocalDevelopmentBridge.environment?.workspacePath);
  const buildRouteKey = normalizeString(
    normalizedBuildProgressionStateMachine.summary?.currentRouteKey,
    "execution",
  );
  const visibleMilestones = unique([
    ...normalizeArray(normalizedSplitWorkspaceModel.visibleMilestones),
    ...normalizeArray(normalizedSplitWorkspaceModel.regions?.build?.visibleMilestones),
  ]);

  return {
    localWorkspaceContract: {
      contractId: `local-workspace:${resolvedProjectId}`,
      status: normalizeString(currentWorkspace.key) ? "ready" : "missing-inputs",
      productClass: normalizeString(productClass, "generic"),
      workspaceMode: mode,
      desktopShellStatus: "deferred-to-w4-mbn-010",
      identity: {
        projectId: resolvedProjectId,
        projectName: normalizeString(projectName),
        workspaceFamily: normalizeString(normalizedSplitWorkspaceModel.workspaceFamily),
        currentWorkspaceKey: normalizeString(currentWorkspace.key),
        buildRouteKey,
      },
      continuity: {
        resumeWorkspace,
        resumeToken,
        canResumeTomorrow: normalizedReturnTomorrowContinuity.canResumeTomorrow === true,
        continuitySource: normalizeString(normalizedReturnTomorrowContinuity.continuitySource, "workspace-navigation"),
        continuityGuarantees: unique([
          "project identity survives reopen",
          "active workspace survives reopen",
          "route-bound workspace context survives restore",
          "build progression remains attached to workspace identity",
          resumeWorkspace ? "resume workspace remains explicit" : null,
          workspacePath ? "local workspace path remains bound to project identity" : null,
        ]),
      },
      localAwareness: {
        workspacePath,
        ideName: normalizeString(normalizedLocalDevelopmentBridge.environment?.ideName),
        hasLocalBridge: normalizedLocalDevelopmentBridge.connection?.isConnected === true,
        cloudWorkspaceId: normalizeString(normalizedCloudWorkspaceModel.workspaceId),
        localAwarenessRequirements: [
          "project name is visible in workspace shell",
          "product class remains attached to workspace identity",
          "current workspace is restorable",
          "current route is resumable",
          "build surface remains coupled to workspace continuity",
        ],
      },
      visibleProof: {
        requiredVisibleProof: [
          "workspace shell exposes project identity",
          "current workspace is visibly restorable",
          "build progression remains attached to the workspace",
        ],
        visibleMilestones,
      },
      boundaries: [
        "Electron shell remains future work under W4-MBN-010",
        "OS-level filesystem ownership is not claimed by W4-MBN-009",
        "desktop packaging truth is not claimed by W4-MBN-009",
      ],
      summary: {
        hasResumeCapability: Boolean(resumeWorkspace || resumeToken),
        hasWorkspacePath: Boolean(workspacePath),
        workspaceMode: mode,
      },
    },
  };
}
