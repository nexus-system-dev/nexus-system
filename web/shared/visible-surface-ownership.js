export const SURFACE_OWNER_RUNTIME_TASK_ID = "SURFACE-OWNER-RUNTIME-001";

const DEFAULT_ROUTE_KEY = "create";

const ROUTES = [
  {
    routeKey: "create",
    path: "/",
    hostSelector: "#screen-create",
    screenOwner: "ProjectCreateScreen",
    adapterOwner: "project-adapter",
    renderOwner: "renderCreateScreenView",
    stateOwner: "create-draft-or-local-session",
    restoreOwner: "fresh-create-route",
    fallbackOwner: "none",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: false,
  },
  {
    routeKey: "loop",
    path: "/loop",
    hostSelector: "#screen-loop",
    screenOwner: "LoopCoreScreen",
    adapterOwner: "loop-adapter",
    renderOwner: "renderLoopCoreScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-loop",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "execution",
    path: "/execution",
    hostSelector: "#screen-execution",
    screenOwner: "ExecutionLiveScreen",
    adapterOwner: "execution-adapter",
    renderOwner: "renderExecutionLiveScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "proof",
    path: "/proof",
    hostSelector: "#screen-proof",
    screenOwner: "ProofResultScreen",
    adapterOwner: "proof-adapter",
    renderOwner: "renderProofResultScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "artifact",
    path: "/artifact",
    hostSelector: "#screen-artifact",
    screenOwner: "ArtifactPreviewScreen",
    adapterOwner: "artifact-preview-adapter",
    renderOwner: "renderArtifactPreviewScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "confirmation",
    path: "/confirmation",
    hostSelector: "#screen-confirmation",
    screenOwner: "ConfirmationDecisionScreen",
    adapterOwner: "confirmation-adapter",
    renderOwner: "renderConfirmationDecisionScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "state-update",
    path: "/state-update",
    hostSelector: "#screen-state-update",
    screenOwner: "StateUpdateScreen",
    adapterOwner: "state-update-adapter",
    renderOwner: "renderStateUpdateScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "next-task",
    path: "/next-task",
    hostSelector: "#screen-next-task",
    screenOwner: "NextTaskScreen",
    adapterOwner: "next-task-adapter",
    renderOwner: "renderNextTaskScreenView",
    stateOwner: "project-service-project-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "timeline",
    path: "/timeline",
    hostSelector: "#screen-timeline",
    screenOwner: "TimelineHistoryScreen",
    adapterOwner: "timeline-adapter",
    renderOwner: "renderTimelineHistoryScreenView",
    stateOwner: "project-service-history-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "release",
    path: "/release",
    hostSelector: "#screen-release",
    screenOwner: "ReleaseSurfaceScreen",
    adapterOwner: "release-surface-adapter",
    renderOwner: "renderReleaseSurfaceScreenView",
    stateOwner: "project-service-release-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "share",
    path: "/share",
    hostSelector: "#screen-share",
    screenOwner: "ShareSurfaceScreen",
    adapterOwner: "share-surface-adapter",
    renderOwner: "renderShareSurfaceScreenView",
    stateOwner: "project-service-share-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "growth",
    path: "/growth",
    hostSelector: "#screen-growth",
    screenOwner: "GrowthSurfaceScreen",
    adapterOwner: "growth-surface-adapter",
    renderOwner: "renderGrowthSurfaceScreenView",
    stateOwner: "project-service-growth-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "studio",
    path: "/studio",
    hostSelector: "#screen-studio",
    screenOwner: "StudioBoundaryScreen",
    adapterOwner: "studio-boundary-adapter",
    renderOwner: "renderStudioBoundaryScreenView",
    stateOwner: "project-service-studio-boundary-truth",
    restoreOwner: "projectId-backend-restore",
    fallbackOwner: "truthful-blocked-route",
    regularRuntime: true,
    qaMayOwn: true,
    backendRestorable: true,
  },
  {
    routeKey: "home",
    path: "/home",
    hostSelector: "#screen-home",
    screenOwner: "HomeSupportScreen",
    adapterOwner: "home-adapter",
    renderOwner: "renderHomeSupportScreenView",
    stateOwner: "project-list-and-local-session",
    restoreOwner: "support-route-project-context",
    fallbackOwner: "none",
    regularRuntime: true,
    qaMayOwn: false,
    backendRestorable: false,
  },
  {
    routeKey: "files",
    path: "/files",
    hostSelector: "#screen-files",
    screenOwner: "FilesSupportScreen",
    adapterOwner: "files-adapter",
    renderOwner: "renderFilesSupportScreenView",
    stateOwner: "project-files-and-draft-file-truth",
    restoreOwner: "support-route-project-context",
    fallbackOwner: "none",
    regularRuntime: true,
    qaMayOwn: false,
    backendRestorable: false,
  },
  {
    routeKey: "settings",
    path: "/settings",
    hostSelector: "#screen-settings",
    screenOwner: "SettingsScreen",
    adapterOwner: "settings-adapter",
    renderOwner: "renderSettingsScreenView",
    stateOwner: "account-settings-profile-surface",
    restoreOwner: "support-route-account-context",
    fallbackOwner: "none",
    regularRuntime: true,
    qaMayOwn: false,
    backendRestorable: false,
  },
  {
    routeKey: "help",
    path: "/help",
    hostSelector: "#screen-help",
    screenOwner: "HelpSupportScreen",
    adapterOwner: "help-adapter",
    renderOwner: "renderHelpSupportScreenView",
    stateOwner: "local-help-content-and-support-draft",
    restoreOwner: "support-route-local-context",
    fallbackOwner: "none",
    regularRuntime: true,
    qaMayOwn: false,
    backendRestorable: false,
  },
  {
    routeKey: "developer",
    path: "/developer",
    hostSelector: "#screen-workspace",
    screenOwner: "legacy-workspace-diagnostics",
    adapterOwner: "web/app.js legacy workspace renderers",
    renderOwner: "renderProject",
    stateOwner: "project-service-project-truth",
    restoreOwner: "diagnostic-route-project-context",
    fallbackOwner: "blocked-without-project",
    regularRuntime: false,
    qaMayOwn: false,
    backendRestorable: false,
  },
  {
    routeKey: "project-brain",
    path: "/project-brain",
    hostSelector: "#screen-workspace",
    screenOwner: "legacy-project-brain-diagnostics",
    adapterOwner: "web/app.js legacy workspace renderers",
    renderOwner: "renderProject",
    stateOwner: "project-service-project-truth",
    restoreOwner: "diagnostic-route-project-context",
    fallbackOwner: "blocked-without-project",
    regularRuntime: false,
    qaMayOwn: false,
    backendRestorable: false,
  },
];

export const visibleSurfaceOwnershipMap = Object.freeze(
  ROUTES.map((route) => Object.freeze({ ...route })),
);

const routeByKey = new Map(visibleSurfaceOwnershipMap.map((route) => [route.routeKey, route]));
const routeByPath = new Map(visibleSurfaceOwnershipMap.map((route) => [route.path, route]));

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

export function resolveVisibleSurfaceRouteKey({ routeKey = null, pathname = null, appScreen = null } = {}) {
  const normalizedRouteKey = normalizeString(routeKey, "");
  if (routeByKey.has(normalizedRouteKey)) {
    return normalizedRouteKey;
  }

  const normalizedScreen = normalizeString(appScreen, "");
  if (routeByKey.has(normalizedScreen)) {
    return normalizedScreen;
  }

  const normalizedPathname = normalizeString(pathname, "/") || "/";
  if (routeByPath.has(normalizedPathname)) {
    return routeByPath.get(normalizedPathname).routeKey;
  }

  return DEFAULT_ROUTE_KEY;
}

export function getVisibleSurfaceOwnership(routeKey = DEFAULT_ROUTE_KEY) {
  return routeByKey.get(resolveVisibleSurfaceRouteKey({ routeKey })) ?? routeByKey.get(DEFAULT_ROUTE_KEY);
}

export function resolveVisibleSurfaceRuntimeMode({
  routeKey = DEFAULT_ROUTE_KEY,
  qaMode = false,
  hasProjectId = false,
  hasCurrentProject = false,
  blockedRoute = false,
  protocol = "http:",
} = {}) {
  const owner = getVisibleSurfaceOwnership(routeKey);
  if (protocol === "file:") {
    return "file-preview";
  }
  if (blockedRoute) {
    return "blocked-route";
  }
  if (qaMode && owner.qaMayOwn) {
    return "qa-preview";
  }
  if (owner.backendRestorable && (hasProjectId || hasCurrentProject)) {
    return "project-backed";
  }
  if (owner.backendRestorable) {
    return "blocked-route";
  }
  if (owner.regularRuntime) {
    return "regular-support";
  }
  return "diagnostic";
}

export function resolveVisibleSurfaceOwnershipProof(input = {}) {
  const routeKey = resolveVisibleSurfaceRouteKey(input);
  const owner = getVisibleSurfaceOwnership(routeKey);
  const runtimeMode = resolveVisibleSurfaceRuntimeMode({ ...input, routeKey });
  const hasQaState = input.hasQaState === true;
  const hasNexusState = input.hasNexusState === true;
  const hasQaScreen = input.hasQaScreen === true;
  const loadedAppScript = normalizeString(input.loadedAppScript, "");
  const loadedStylesheet = normalizeString(input.loadedStylesheet, "");
  const invalidators = [];

  if (runtimeMode === "file-preview") {
    invalidators.push("file-preview");
  }
  if (!loadedAppScript.includes("app.js")) {
    invalidators.push("app-js-not-proven");
  }
  if (!loadedStylesheet.includes("styles.css")) {
    invalidators.push("styles-css-not-proven");
  }
  if (!input.qaMode && (hasQaState || hasNexusState || hasQaScreen)) {
    invalidators.push("qa-state-on-regular-route");
  }
  if (owner.backendRestorable && runtimeMode !== "project-backed") {
    invalidators.push("backend-route-not-project-backed");
  }

  return {
    taskId: SURFACE_OWNER_RUNTIME_TASK_ID,
    routeKey,
    path: owner.path,
    hostSelector: owner.hostSelector,
    screenOwner: owner.screenOwner,
    adapterOwner: owner.adapterOwner,
    renderOwner: owner.renderOwner,
    stateOwner: owner.stateOwner,
    restoreOwner: owner.restoreOwner,
    fallbackOwner: owner.fallbackOwner,
    runtimeMode,
    backendRestorable: owner.backendRestorable,
    qaMayOwn: owner.qaMayOwn,
    regularRuntime: owner.regularRuntime,
    loadedAppScript,
    loadedStylesheet,
    invalidators,
    proofValid: invalidators.length === 0,
  };
}

export function buildVisibleSurfaceProofDataset(input = {}) {
  const proof = resolveVisibleSurfaceOwnershipProof(input);
  return {
    surfaceOwnerTask: proof.taskId,
    surfaceOwnerRoute: proof.routeKey,
    surfaceOwnerHost: proof.hostSelector,
    surfaceOwnerScreen: proof.screenOwner,
    surfaceOwnerAdapter: proof.adapterOwner,
    surfaceOwnerRender: proof.renderOwner,
    surfaceOwnerState: proof.stateOwner,
    surfaceOwnerRestore: proof.restoreOwner,
    surfaceOwnerRuntimeMode: proof.runtimeMode,
    surfaceOwnerProofValid: String(proof.proofValid),
    surfaceOwnerInvalidators: proof.invalidators.join(","),
  };
}
