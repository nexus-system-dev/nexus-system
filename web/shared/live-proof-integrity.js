import { SURFACE_OWNER_RUNTIME_TASK_ID } from "./visible-surface-ownership.js";

export const LIVE_PROOF_INTEGRITY_TASK_ID = "LIVE-PROOF-INTEGRITY-001";

const SOURCE_TO_ROUTE_RULES = [
  { pattern: /web\/app\.js$/, routes: ["all"] },
  { pattern: /web\/index\.html$/, routes: ["all"] },
  { pattern: /web\/styles\.css$/, routes: ["all"] },
  { pattern: /web\/shared\/visible-surface-ownership\.js$/, routes: ["all"] },
  { pattern: /web\/shared\/live-proof-integrity\.js$/, routes: ["all"] },
  { pattern: /test\/.+\.test\.js$/, routes: ["all"] },
  { pattern: /scripts\/verify-.+\.mjs$/, routes: ["all"] },
  { pattern: /docs\/operating-system\/nexus-canonical-implementation-task-map-2026-05-26\.md$/, routes: ["all"] },
  { pattern: /docs\/wave3-canonical-state\.json$/, routes: ["all"] },
  { pattern: /web\/nexus-ui\/screens\/ProjectCreateScreen\.js$/, routes: ["create"] },
  { pattern: /web\/nexus-ui\/adapters\/project-adapter\.js$/, routes: ["create"] },
  { pattern: /web\/nexus-ui\/screens\/LoopCoreScreen\.js$/, routes: ["loop"] },
  { pattern: /web\/nexus-ui\/adapters\/loop-adapter\.js$/, routes: ["loop"] },
  { pattern: /web\/nexus-ui\/screens\/ExecutionLiveScreen\.js$/, routes: ["execution"] },
  { pattern: /web\/nexus-ui\/adapters\/execution-adapter\.js$/, routes: ["execution"] },
  { pattern: /web\/nexus-ui\/screens\/ProofResultScreen\.js$/, routes: ["proof"] },
  { pattern: /web\/nexus-ui\/adapters\/proof-adapter\.js$/, routes: ["proof"] },
  { pattern: /web\/nexus-ui\/screens\/ArtifactPreviewScreen\.js$/, routes: ["artifact"] },
  { pattern: /web\/nexus-ui\/adapters\/artifact-preview-adapter\.js$/, routes: ["artifact"] },
  { pattern: /web\/nexus-ui\/screens\/ConfirmationDecisionScreen\.js$/, routes: ["confirmation"] },
  { pattern: /web\/nexus-ui\/adapters\/confirmation-adapter\.js$/, routes: ["confirmation"] },
  { pattern: /web\/nexus-ui\/screens\/StateUpdateScreen\.js$/, routes: ["state-update"] },
  { pattern: /web\/nexus-ui\/adapters\/state-update-adapter\.js$/, routes: ["state-update"] },
  { pattern: /web\/nexus-ui\/screens\/NextTaskScreen\.js$/, routes: ["next-task"] },
  { pattern: /web\/nexus-ui\/adapters\/next-task-adapter\.js$/, routes: ["next-task"] },
  { pattern: /web\/nexus-ui\/screens\/TimelineHistoryScreen\.js$/, routes: ["timeline"] },
  { pattern: /web\/nexus-ui\/adapters\/timeline-adapter\.js$/, routes: ["timeline"] },
  { pattern: /web\/nexus-ui\/screens\/ReleaseSurfaceScreen\.js$/, routes: ["release"] },
  { pattern: /web\/nexus-ui\/adapters\/release-surface-adapter\.js$/, routes: ["release"] },
  { pattern: /web\/nexus-ui\/screens\/ShareSurfaceScreen\.js$/, routes: ["share"] },
  { pattern: /web\/nexus-ui\/adapters\/share-surface-adapter\.js$/, routes: ["share"] },
  { pattern: /web\/nexus-ui\/screens\/GrowthSurfaceScreen\.js$/, routes: ["growth"] },
  { pattern: /web\/nexus-ui\/adapters\/growth-surface-adapter\.js$/, routes: ["growth"] },
  { pattern: /web\/nexus-ui\/screens\/StudioBoundaryScreen\.js$/, routes: ["studio"] },
  { pattern: /web\/nexus-ui\/adapters\/studio-boundary-adapter\.js$/, routes: ["studio"] },
  { pattern: /web\/nexus-ui\/screens\/HomeSupportScreen\.js$/, routes: ["home"] },
  { pattern: /web\/nexus-ui\/adapters\/home-adapter\.js$/, routes: ["home"] },
  { pattern: /web\/nexus-ui\/screens\/FilesSupportScreen\.js$/, routes: ["files"] },
  { pattern: /web\/nexus-ui\/adapters\/files-adapter\.js$/, routes: ["files"] },
  { pattern: /web\/nexus-ui\/screens\/SettingsScreen\.js$/, routes: ["settings"] },
  { pattern: /web\/nexus-ui\/adapters\/settings-adapter\.js$/, routes: ["settings"] },
  { pattern: /web\/nexus-ui\/screens\/HelpSupportScreen\.js$/, routes: ["help"] },
  { pattern: /web\/nexus-ui\/adapters\/help-adapter\.js$/, routes: ["help"] },
];

function normalizeString(value, fallback = "") {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function resolveChangedFileRoutes(changedFiles = []) {
  return normalizeArray(changedFiles).map((filePath) => {
    const normalizedPath = normalizeString(filePath);
    const rule = SOURCE_TO_ROUTE_RULES.find(({ pattern }) => pattern.test(normalizedPath));
    return {
      filePath: normalizedPath,
      routes: rule?.routes ?? [],
      reachable: Boolean(rule),
    };
  });
}

function proofHasLoadedAssets(surfaceProof) {
  return normalizeString(surfaceProof.loadedAppScript).includes("app.js")
    && normalizeString(surfaceProof.loadedStylesheet).includes("styles.css");
}

function isRegularVisibleRuntime(surfaceProof) {
  const mode = normalizeString(surfaceProof.surfaceOwnerRuntimeMode ?? surfaceProof.runtimeMode);
  return mode === "project-backed" || mode === "regular-support";
}

function proofRoute(surfaceProof) {
  return normalizeString(surfaceProof.surfaceOwnerRoute ?? surfaceProof.routeKey);
}

function proofInvalidators(surfaceProof) {
  const rawInvalidators = surfaceProof.surfaceOwnerInvalidators ?? surfaceProof.invalidators ?? "";
  if (Array.isArray(rawInvalidators)) {
    return rawInvalidators.filter(Boolean);
  }
  return normalizeString(rawInvalidators)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isQaContaminated(surfaceProof) {
  return surfaceProof.hasQaState === true
    || surfaceProof.hasNexusState === true
    || surfaceProof.hasQaScreen === true
    || /[?&]qa=1(?:&|$)/.test(normalizeString(surfaceProof.url));
}

export function createClaimToVisibleProofMatrix(input = {}) {
  const surfaceProof = normalizeObject(input.surfaceProof);
  const changedFiles = normalizeArray(input.changedFiles).map(normalizeString).filter(Boolean);
  const changedFileRoutes = resolveChangedFileRoutes(changedFiles);
  const routeKey = proofRoute(surfaceProof);
  return {
    taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
    claim: {
      taskId: normalizeString(input.taskId),
      statusClaim: normalizeString(input.statusClaim),
      behaviorClaim: normalizeString(input.behaviorClaim),
      regularUserRuntimeClaim: input.regularUserRuntimeClaim !== false,
    },
    changedFiles,
    changedFileRoutes,
    route: {
      routeKey,
      url: normalizeString(surfaceProof.url),
      port: normalizeString(surfaceProof.port),
      visibleHostId: normalizeString(surfaceProof.visibleHostId),
      surfaceOwnerTask: normalizeString(surfaceProof.surfaceOwnerTask ?? surfaceProof.taskId),
      surfaceOwnerHost: normalizeString(surfaceProof.surfaceOwnerHost ?? surfaceProof.hostSelector),
      surfaceOwnerScreen: normalizeString(surfaceProof.surfaceOwnerScreen ?? surfaceProof.screenOwner),
      surfaceOwnerAdapter: normalizeString(surfaceProof.surfaceOwnerAdapter ?? surfaceProof.adapterOwner),
      surfaceOwnerState: normalizeString(surfaceProof.surfaceOwnerState ?? surfaceProof.stateOwner),
      surfaceOwnerRestore: normalizeString(surfaceProof.surfaceOwnerRestore ?? surfaceProof.restoreOwner),
      runtimeMode: normalizeString(surfaceProof.surfaceOwnerRuntimeMode ?? surfaceProof.runtimeMode),
      proofValid: String(surfaceProof.surfaceOwnerProofValid ?? surfaceProof.proofValid) === "true",
      invalidators: proofInvalidators(surfaceProof),
    },
    assets: {
      loadedAppScript: normalizeString(surfaceProof.loadedAppScript),
      loadedStylesheet: normalizeString(surfaceProof.loadedStylesheet),
      loaded: proofHasLoadedAssets(surfaceProof),
    },
    state: {
      hasQaState: surfaceProof.hasQaState === true,
      hasNexusState: surfaceProof.hasNexusState === true,
      hasQaScreen: surfaceProof.hasQaScreen === true,
      hasProjectId: surfaceProof.hasProjectId === true,
    },
    proof: {
      browserProof: input.browserProof === true,
      refreshProof: input.refreshProof === true,
      restoreProof: input.restoreProof === true,
      repositoryDiffProof: changedFiles.length > 0,
      behaviorProof: input.behaviorProof === true,
      artifactPaths: normalizeArray(input.artifactPaths).map(normalizeString).filter(Boolean),
      verificationCommands: normalizeArray(input.verificationCommands).map(normalizeString).filter(Boolean),
    },
  };
}

export function validateClaimToVisibleProof(input = {}) {
  const inputLooksLikeMatrix = Boolean(input.claim && input.route && input.proof);
  const matrix = input.taskId === LIVE_PROOF_INTEGRITY_TASK_ID && inputLooksLikeMatrix
    ? input
    : createClaimToVisibleProofMatrix(input);
  const blockers = [];
  const routeKey = matrix.route.routeKey;

  if (!matrix.claim.taskId) {
    blockers.push("missing-claim-task-id");
  }
  if (!matrix.claim.statusClaim) {
    blockers.push("missing-status-claim");
  }
  if (!matrix.claim.behaviorClaim) {
    blockers.push("missing-behavior-claim");
  }
  if (matrix.route.surfaceOwnerTask !== SURFACE_OWNER_RUNTIME_TASK_ID) {
    blockers.push("missing-surface-owner-proof");
  }
  if (!matrix.route.proofValid || matrix.route.invalidators.length > 0) {
    blockers.push("invalid-surface-owner-proof");
  }
  if (!matrix.assets.loaded) {
    blockers.push("loaded-assets-not-proven");
  }
  if (matrix.claim.regularUserRuntimeClaim && !isRegularVisibleRuntime({
    surfaceOwnerRuntimeMode: matrix.route.runtimeMode,
  })) {
    blockers.push("not-regular-visible-runtime");
  }
  if (matrix.claim.regularUserRuntimeClaim && (matrix.state.hasQaState || matrix.state.hasNexusState || matrix.state.hasQaScreen)) {
    blockers.push("qa-state-contaminates-regular-claim");
  }
  if (matrix.claim.regularUserRuntimeClaim && isQaContaminated({
    url: matrix.route.url,
    hasQaState: matrix.state.hasQaState,
    hasNexusState: matrix.state.hasNexusState,
    hasQaScreen: matrix.state.hasQaScreen,
  })) {
    blockers.push("qa-route-contaminates-regular-claim");
  }
  if (!matrix.proof.browserProof) {
    blockers.push("missing-browser-proof");
  }
  if (!matrix.proof.refreshProof) {
    blockers.push("missing-refresh-proof");
  }
  if (!matrix.proof.restoreProof) {
    blockers.push("missing-restore-proof");
  }
  if (!matrix.proof.repositoryDiffProof) {
    blockers.push("missing-repository-diff-proof");
  }
  if (!matrix.proof.behaviorProof) {
    blockers.push("missing-behavior-proof");
  }
  if (matrix.proof.artifactPaths.length === 0) {
    blockers.push("missing-proof-artifact-paths");
  }
  if (matrix.proof.verificationCommands.length === 0) {
    blockers.push("missing-verification-commands");
  }

  const unreachableChangedFiles = matrix.changedFileRoutes.filter((file) => !file.reachable);
  if (unreachableChangedFiles.length > 0) {
    blockers.push("changed-file-route-unmapped");
  }

  const routeMismatches = matrix.changedFileRoutes.filter((file) => {
    if (!file.reachable || file.routes.includes("all")) {
      return false;
    }
    return !file.routes.includes(routeKey);
  });
  if (routeMismatches.length > 0) {
    blockers.push("changed-file-not-reachable-from-tested-route");
  }

  return {
    taskId: LIVE_PROOF_INTEGRITY_TASK_ID,
    status: blockers.length === 0 ? "pass" : "blocked",
    canClaimTrueGreen: blockers.length === 0,
    blockers,
    matrix,
  };
}

export function assertClaimToVisibleProof(input = {}) {
  const result = validateClaimToVisibleProof(input);
  if (!result.canClaimTrueGreen) {
    throw new Error(`LIVE-PROOF-INTEGRITY-001 blocked: ${result.blockers.join(", ")}`);
  }
  return result;
}
