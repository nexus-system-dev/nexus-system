function unique(values = []) {
  return [...new Set(values.filter(Boolean))];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

const BUILD_PROGRESSION_STATE_DEFINITIONS = {
  "class-locked": {
    label: "ה־class ננעל",
    routeKey: "understanding",
    regionFocus: "orchestration-region",
    surfaceExpectation: "המשתמש מבין איזה class Nexus עומדת לבנות",
    nextStateId: "skeleton-visible",
  },
  "skeleton-visible": {
    label: "השלד נראה על המסך",
    routeKey: "execution",
    regionFocus: "build-region",
    surfaceExpectation: "build region ראשון נראה לעין ולא נשאר center text",
    nextStateId: "surface-evolving",
  },
  "surface-evolving": {
    label: "ה־surface מתפתח",
    routeKey: "execution",
    regionFocus: "build-region",
    surfaceExpectation: "milestones class-aware נסגרים על המוצר עצמו",
    nextStateId: "preview-reviewable",
  },
  "preview-reviewable": {
    label: "ה־preview מוכן לבדיקה",
    routeKey: "proof",
    regionFocus: "build-region",
    surfaceExpectation: "אפשר לבחון proof/preview עם תוצר שניתן להערכה",
    nextStateId: "release-path-visible",
  },
  "release-path-visible": {
    label: "כיוון ה־release גלוי",
    routeKey: "artifact",
    regionFocus: "runtime-region",
    surfaceExpectation: "runtime, package, ו־release direction גלויים ומשכנעים",
    nextStateId: "continuation-ready",
  },
  "continuation-ready": {
    label: "סבב ההמשך מוכן",
    routeKey: "next-task",
    regionFocus: "runtime-region",
    surfaceExpectation: "המשתמש רואה מהו ה־next loop שנפתח מהמוצר הנוכחי",
    nextStateId: null,
  },
};

const PROJECT_STAGE_TO_BUILD_STATE = {
  "class-resolution": "class-locked",
  bootstrap: "skeleton-visible",
  build: "surface-evolving",
  "build-validation": "preview-reviewable",
  "release-prep": "release-path-visible",
  continuation: "continuation-ready",
};

function resolveCurrentStateId({ projectStage = "bootstrap" } = {}) {
  return PROJECT_STAGE_TO_BUILD_STATE[projectStage] ?? "skeleton-visible";
}

function resolveOverlayStatus({ progressState = null } = {}) {
  const progress = normalizeObject(progressState);
  if (progress.status === "failed") {
    return "failed";
  }
  if (progress.status === "blocked") {
    return "blocked";
  }
  if (progress.status === "done") {
    return "done";
  }
  if (progress.status === "active" || progress.phase === "running" || progress.phase === "completed") {
    return "active";
  }
  return "pending";
}

function buildState({
  stateId,
  currentStateId,
  currentStateOrder,
  visibleMilestones = [],
  requiredSurfaceElements = [],
  overlayStatus = "pending",
} = {}) {
  const definition = BUILD_PROGRESSION_STATE_DEFINITIONS[stateId];
  const stateOrder = Object.keys(BUILD_PROGRESSION_STATE_DEFINITIONS).indexOf(stateId);
  let status = "pending";
  if (stateOrder < currentStateOrder) {
    status = "done";
  } else if (stateId === currentStateId) {
    status = overlayStatus === "done" ? "done" : overlayStatus === "failed" ? "failed" : overlayStatus === "blocked" ? "blocked" : "active";
  }

  return {
    stateId,
    label: definition.label,
    routeKey: definition.routeKey,
    regionFocus: definition.regionFocus,
    surfaceExpectation: definition.surfaceExpectation,
    nextStateId: definition.nextStateId,
    status,
    visibleMilestones: unique(visibleMilestones),
    requiredSurfaceElements: unique(requiredSurfaceElements),
  };
}

export function createBuildProgressionStateMachine({
  productClass = "generic",
  projectStage = "bootstrap",
  progressState = null,
  splitWorkspaceLiveBuildSurfaceModel = null,
  skeletonContract = null,
  skeletonQualityBaseline = null,
  runtimeDirection = null,
  releasePlan = null,
} = {}) {
  const currentStateId = resolveCurrentStateId({ projectStage });
  const currentStateOrder = Object.keys(BUILD_PROGRESSION_STATE_DEFINITIONS).indexOf(currentStateId);
  const overlayStatus = resolveOverlayStatus({ progressState });
  const splitWorkspaceModel = normalizeObject(splitWorkspaceLiveBuildSurfaceModel);
  const buildRegion = normalizeObject(splitWorkspaceModel.regions?.build);
  const runtimeRegion = normalizeObject(splitWorkspaceModel.regions?.runtime);
  const visibleMilestones = unique([
    ...(buildRegion.visibleMilestones ?? []),
    ...(skeletonContract?.visibleMilestones ?? []),
  ]);
  const requiredSurfaceElements = unique([
    ...(buildRegion.requiredSurfaceElements ?? []),
    ...(skeletonQualityBaseline?.requiredSurfaceElements ?? []),
  ]);

  const states = Object.keys(BUILD_PROGRESSION_STATE_DEFINITIONS).map((stateId) =>
    buildState({
      stateId,
      currentStateId,
      currentStateOrder,
      visibleMilestones,
      requiredSurfaceElements,
      overlayStatus,
    }),
  );

  return {
    machineId: `build-progression:${productClass}:${projectStage}`,
    productClass,
    projectStage,
    currentStateId,
    overlayStatus,
    routeBindingFamily: "wave4-build-progression",
    workspaceFamily: splitWorkspaceModel.workspaceFamily ?? null,
    previewFrameFamily: splitWorkspaceModel.previewFrameFamily ?? runtimeDirection?.previewFamily ?? null,
    releasePathFamily: runtimeRegion.releasePathFamily ?? releasePlan?.releaseTarget ?? runtimeDirection?.releasePathFamily ?? null,
    states,
    restoreKeys: ["currentStateId", "overlayStatus", "projectStage"],
    summary: {
      currentRouteKey: BUILD_PROGRESSION_STATE_DEFINITIONS[currentStateId].routeKey,
      currentLabel: BUILD_PROGRESSION_STATE_DEFINITIONS[currentStateId].label,
      totalStates: states.length,
      currentVisibleMilestoneCount: visibleMilestones.length,
      currentRequiredSurfaceCount: requiredSurfaceElements.length,
    },
  };
}
