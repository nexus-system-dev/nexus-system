function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildVerificationItem({
  laneId,
  title,
  routeKey,
  visibleAnchor,
  verificationFocus = [],
  passCriteria = [],
  restoreChecks = [],
  strongerPreviewPath,
} = {}) {
  return {
    laneId,
    title,
    routeKey: normalizeString(routeKey, "unknown-route"),
    visibleAnchor: normalizeString(visibleAnchor, "not-yet-visible"),
    verificationFocus: normalizeArray(verificationFocus).map((item) => normalizeString(item)).filter(Boolean),
    passCriteria: normalizeArray(passCriteria).map((item) => normalizeString(item)).filter(Boolean),
    restoreChecks: normalizeArray(restoreChecks).map((item) => normalizeString(item)).filter(Boolean),
    strongerPreviewPath: normalizeString(strongerPreviewPath, "qa-route-or-live-project"),
  };
}

export function createWave4LiveVerificationMatrix({
  productClass = null,
  projectStage = null,
  buildProgressionStateMachine = null,
  classAwareGenerationContract = null,
  classSpecificSurfaceEvolutionRules = null,
  localWorkspaceContract = null,
  classAwareRuntimeResolver = null,
  classAwarePackagingPreviewContract = null,
  releaseableProductStateContract = null,
  releaseEvidenceHandoffModel = null,
  postReleaseContinuationLoop = null,
  growthOpportunitySurfacingBoundary = null,
  classAwareDeploymentReleasePath = null,
  deploymentStateFeedbackContract = null,
  crossSurfaceContinuityContract = null,
} = {}) {
  const buildProgression = normalizeObject(buildProgressionStateMachine);
  const generationContract = normalizeObject(classAwareGenerationContract);
  const surfaceRules = normalizeObject(classSpecificSurfaceEvolutionRules);
  const workspaceContract = normalizeObject(localWorkspaceContract);
  const runtimeResolver = normalizeObject(classAwareRuntimeResolver);
  const packagingContract = normalizeObject(classAwarePackagingPreviewContract);
  const releaseableState = normalizeObject(releaseableProductStateContract);
  const releaseEvidence = normalizeObject(releaseEvidenceHandoffModel);
  const continuation = normalizeObject(postReleaseContinuationLoop);
  const growthBoundary = normalizeObject(growthOpportunitySurfacingBoundary);
  const deploymentPath = normalizeObject(classAwareDeploymentReleasePath);
  const deploymentFeedback = normalizeObject(deploymentStateFeedbackContract);
  const crossSurfaceContinuity = normalizeObject(crossSurfaceContinuityContract);

  const verificationLanes = [
    buildVerificationItem({
      laneId: "product-understanding-and-class-resolution",
      title: "Product understanding and class resolution",
      routeKey: "understanding",
      visibleAnchor: `${normalizeString(productClass, "generic")} · ${normalizeString(projectStage, "unknown-stage")}`,
      verificationFocus: [
        "project class is explicit",
        "runtime direction is explainable before build starts",
      ],
      passCriteria: [
        "pass if the visible route makes the chosen class and stage explicit before execution",
        "fail if class or stage only exist in hidden state",
      ],
      restoreChecks: [
        "class identity survives route restore",
        "understanding handoff survives revisit",
      ],
      strongerPreviewPath: "understanding-summary-route",
    }),
    buildVerificationItem({
      laneId: "automatic-product-bootstrap",
      title: "Automatic product bootstrap",
      routeKey: "execution",
      visibleAnchor: normalizeString(buildProgression.summary?.currentLabel, "not-yet-visible"),
      verificationFocus: [
        "bootstrap opens a real product build path",
        "build state is route-bound and visible",
      ],
      passCriteria: [
        "pass if build progression is visible before proof",
        "fail if bootstrap ends at hidden status only",
      ],
      restoreChecks: [
        "build route survives refresh",
        "state machine survives reopen",
      ],
      strongerPreviewPath: "execution-route",
    }),
    buildVerificationItem({
      laneId: "live-build-surfaces",
      title: "Live build surfaces",
      routeKey: "execution",
      visibleAnchor: normalizeString(buildProgression.currentStateId, "not-yet-visible"),
      verificationFocus: [
        "stage-to-stage product evolution is visible",
        "build surface changes, not only percentages",
      ],
      passCriteria: [
        "pass if visible build states map to product-facing change",
        "fail if only percent/status changes",
      ],
      restoreChecks: [
        "current build state survives restore",
        "visible state remains attached to the same project identity",
      ],
      strongerPreviewPath: "execution-route",
    }),
    buildVerificationItem({
      laneId: "class-aware-product-generation",
      title: "Class-aware product generation",
      routeKey: "proof",
      visibleAnchor: normalizeString(generationContract.generationIntent?.proofArtifactType, "not-yet-visible"),
      verificationFocus: [
        normalizeString(surfaceRules.frontendSurfaceType, "surface-type"),
        normalizeString(surfaceRules.sceneType, "scene-type"),
        normalizeString(generationContract.surfaceMutationModel, "mutation-model"),
      ],
      passCriteria: [
        "pass if proof shows class-specific artifact intent instead of generic output",
        "fail if generation resets to generic placeholder truth",
      ],
      restoreChecks: [
        "generation class stays aligned after revisit",
        "artifact expectation survives proof reopen",
      ],
      strongerPreviewPath: "proof-route",
    }),
    buildVerificationItem({
      laneId: "local-workspace-electron-shell",
      title: "Local workspace continuity",
      routeKey: "execution",
      visibleAnchor: normalizeString(workspaceContract.continuity?.resumeWorkspace, normalizeString(workspaceContract.workspaceMode, "not-yet-visible")),
      verificationFocus: [
        "workspace identity remains explicit",
        "resume path remains visible",
      ],
      passCriteria: [
        "pass if workspace continuity is visible before any desktop-shell claim",
        "fail if workspace truth disappears after route change",
      ],
      restoreChecks: [
        "workspace route is resumable",
        "build progression remains attached to workspace identity",
      ],
      strongerPreviewPath: "execution-route",
    }),
    buildVerificationItem({
      laneId: "runtime-packaging-resolver",
      title: "Runtime and packaging resolver",
      routeKey: "execution",
      visibleAnchor: normalizeString(runtimeResolver.summary?.projectFacingPath, "not-yet-visible"),
      verificationFocus: [
        normalizeString(runtimeResolver.runtimeFamily, "runtime-family"),
        normalizeString(packagingContract.previewMode, "preview-mode"),
        normalizeString(packagingContract.packageMode, "package-mode"),
      ],
      passCriteria: [
        "pass if runtime, preview, and package direction are visible and class-aware",
        "fail if runtime decisions stay hidden in internal resolver state",
      ],
      restoreChecks: [
        "preview/package mode survives reopen",
        "runtime direction remains explainable on return",
      ],
      strongerPreviewPath: "execution-route",
    }),
    buildVerificationItem({
      laneId: "releaseable-output",
      title: "Releaseable output",
      routeKey: "proof",
      visibleAnchor: normalizeString(releaseEvidence.explainableReleasePath, normalizeString(releaseableState.summary?.label, "not-yet-visible")),
      verificationFocus: [
        normalizeString(releaseableState.releaseTarget, "release-target"),
        normalizeString(releaseableState.packageArtifactType, "package-artifact"),
        normalizeString(releaseEvidence.nextAction, "next-action"),
      ],
      passCriteria: [
        "pass if releaseability and handoff are visible from the built product surface",
        "fail if release stops at artifact summary only",
      ],
      restoreChecks: [
        "release evidence survives revisit",
        "handoff path survives route restore",
      ],
      strongerPreviewPath: "proof-route",
    }),
    buildVerificationItem({
      laneId: "continuation-growth-loop",
      title: "Continuation and growth boundary",
      routeKey: "next-task",
      visibleAnchor: normalizeString(continuation.nextMoveTitle, normalizeString(growthBoundary.statusLabel, "not-yet-visible")),
      verificationFocus: [
        "post-release continuation is product-connected",
        "growth boundary stays bounded to Wave 4 truth",
      ],
      passCriteria: [
        "pass if continuation opens from approved product state and stays bounded",
        "fail if next-task becomes free-form planning or fake autonomy",
      ],
      restoreChecks: [
        "continuation survives revisit",
        "growth boundary survives route restore",
      ],
      strongerPreviewPath: "next-task-route",
    }),
    buildVerificationItem({
      laneId: "deployment-release-path",
      title: "Deployment and release path",
      routeKey: "execution",
      visibleAnchor: normalizeString(deploymentPath.primaryTarget, normalizeString(deploymentFeedback.statusLabel, "not-yet-visible")),
      verificationFocus: [
        normalizeString(deploymentPath.pathFamily, "deployment-path"),
        normalizeString(deploymentFeedback.latestProviderStatus, "provider-status"),
        normalizeString(deploymentFeedback.policyDecision, "policy-decision"),
      ],
      passCriteria: [
        "pass if deployment path and deployment feedback are visible in Nexus",
        "fail if provider/release truth lives only in logs or backend events",
      ],
      restoreChecks: [
        "deployment feedback survives refresh",
        "deployment/release path survives reopen",
      ],
      strongerPreviewPath: "execution-route",
    }),
    buildVerificationItem({
      laneId: "live-orchestration-continuity",
      title: "Live orchestration continuity",
      routeKey: "timeline",
      visibleAnchor: normalizeString(crossSurfaceContinuity.statusLabel, "not-yet-visible"),
      verificationFocus: [
        "cross-surface loop is explainable",
        "restore and continuity checks are explicit",
      ],
      passCriteria: [
        "pass if the visible matrix includes continuity and restore checks across the loop",
        "fail if verification remains ad hoc per agent or per route",
      ],
      restoreChecks: normalizeArray(crossSurfaceContinuity.continuityChecks),
      strongerPreviewPath: "timeline-route",
    }),
  ];

  return {
    wave4LiveVerificationMatrix: {
      matrixId: `wave4-live-verification:${normalizeString(productClass, "generic")}`,
      matrixFamily: "wave4-live-verification-matrix",
      status: "ready",
      statusLabel: "ל־Wave 4 יש מטריצת אימות חיה אחת",
      matrixRule: "every major Wave 4 capability must declare one visible route, one visible anchor, pass/fail truth, and restore/continuity checks before later live reruns can close the wave truthfully",
      strongerPreviewRule: "use the stronger preview path when available; do not rely on hidden state, test output, or contract text alone",
      restoreRule: "the live verification matrix must include refresh, route restore, revisit, and transition checks wherever the capability changes user-facing product truth",
      verificationLanes,
      summary: {
        totalLanes: verificationLanes.length,
        executionRoutes: verificationLanes.filter((item) => item.routeKey === "execution").length,
        proofRoutes: verificationLanes.filter((item) => item.routeKey === "proof").length,
        restoreChecks: verificationLanes.reduce((total, item) => total + item.restoreChecks.length, 0),
      },
    },
  };
}
