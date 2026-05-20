function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function createSurfaceStep({
  surfaceId,
  routeKey,
  title,
  status,
  visibleAnchor,
  continuityRule,
}) {
  return {
    surfaceId,
    routeKey,
    title,
    status: normalizeString(status, "pending"),
    visibleAnchor: normalizeString(visibleAnchor, "not-yet-visible"),
    continuityRule: normalizeString(continuityRule, "continuity must survive route restore"),
  };
}

function resolveContractStatus(steps) {
  if (steps.every((step) => normalizeString(step.visibleAnchor) && step.visibleAnchor !== "not-yet-visible")) {
    return "connected";
  }
  if (steps.some((step) => normalizeString(step.visibleAnchor) && step.visibleAnchor !== "not-yet-visible")) {
    return "partial";
  }
  return "missing";
}

function resolveStatusLabel(status) {
  if (status === "connected") {
    return "הרצף בין המסכים נשאר מחובר";
  }
  if (status === "partial") {
    return "הרצף כבר התחיל להיסגר";
  }
  return "הרצף עוד לא הוגדר truthfully";
}

export function createCrossSurfaceContinuityContract({
  buildProgressionStateMachine = null,
  proofArtifact = null,
  releaseEvidenceHandoffModel = null,
  deploymentStateFeedbackContract = null,
  postReleaseContinuationLoop = null,
} = {}) {
  const buildProgression = normalizeObject(buildProgressionStateMachine);
  const artifact = normalizeObject(proofArtifact);
  const releaseEvidence = normalizeObject(releaseEvidenceHandoffModel);
  const deploymentFeedback = normalizeObject(deploymentStateFeedbackContract);
  const continuation = normalizeObject(postReleaseContinuationLoop);

  const steps = [
    createSurfaceStep({
      surfaceId: "build",
      routeKey: normalizeString(buildProgression.summary?.currentRouteKey, "execution"),
      title: "Build / execution",
      status: normalizeString(buildProgression.overlayStatus, "pending"),
      visibleAnchor: normalizeString(buildProgression.summary?.currentLabel, "not-yet-visible"),
      continuityRule: "build progression must stay visible before the user moves into proof or release truth",
    }),
    createSurfaceStep({
      surfaceId: "artifact",
      routeKey: "proof",
      title: "Proof / artifact",
      status: normalizeString(artifact.status, "ready"),
      visibleAnchor: normalizeString(artifact.title, "not-yet-visible"),
      continuityRule: "the product artifact must remain the same visible reference when the user moves into proof",
    }),
    createSurfaceStep({
      surfaceId: "release-evidence",
      routeKey: "proof",
      title: "Release evidence / handoff",
      status: normalizeString(releaseEvidence.status, "not-ready"),
      visibleAnchor: normalizeString(releaseEvidence.explainableReleasePath, "not-yet-visible"),
      continuityRule: normalizeString(
        releaseEvidence.persistenceRule,
        "release evidence and handoff must survive proof revisit, route restore, and the next confirmation step",
      ),
    }),
    createSurfaceStep({
      surfaceId: "deployment-feedback",
      routeKey: "execution",
      title: "Deployment feedback",
      status: normalizeString(deploymentFeedback.status, "pending"),
      visibleAnchor: normalizeString(deploymentFeedback.statusLabel, "not-yet-visible"),
      continuityRule: normalizeString(
        deploymentFeedback.continuityRule,
        "deployment state must survive refresh, route restore, and the handoff from execution into later release feedback",
      ),
    }),
    createSurfaceStep({
      surfaceId: "continuation",
      routeKey: "next-task",
      title: "Post-release continuation",
      status: normalizeString(continuation.status, "not-ready"),
      visibleAnchor: normalizeString(continuation.nextMoveTitle, "not-yet-visible"),
      continuityRule: normalizeString(
        continuation.continuityRule,
        "post-release continuation must survive revisit, route restore, and transition back into execution",
      ),
    }),
    createSurfaceStep({
      surfaceId: "timeline",
      routeKey: "timeline",
      title: "Timeline continuity",
      status: "connected",
      visibleAnchor: "timeline-keeps-the-loop-connected",
      continuityRule: "timeline must preserve the visible story from build to proof to release to continuation without disconnect",
    }),
  ];

  const status = resolveContractStatus(steps);
  const routeSequence = normalizeArray(steps.map((step) => step.routeKey));

  return {
    crossSurfaceContinuityContract: {
      contractId: `cross-surface-continuity:${normalizeString(artifact.artifactId, "unknown-artifact")}`,
      continuityFamily: "cross-surface-continuity",
      status,
      statusLabel: resolveStatusLabel(status),
      visibleContinuityRule: "build, proof, release, deployment feedback, timeline, and continuation must read like one connected product loop inside Nexus",
      routeSequence,
      explainablePath: steps.map((step) => `${step.routeKey}:${step.surfaceId}`).join(" -> "),
      continuityChecks: [
        "same-project-identity-across-surfaces",
        "route-restore-survives-refresh",
        "proof-and-release-remain-connected",
        "continuation-opens-from-approved-surface",
        "timeline-preserves-the-loop-story",
      ],
      continuitySteps: steps,
      restoreRule: "cross-surface continuity must survive refresh, route restore, revisit, and transition back into execution without changing product truth silently",
    },
  };
}
