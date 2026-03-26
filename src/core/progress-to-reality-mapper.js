function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function inferRealitySignals(progressState, executionResult, artifacts, releaseStateUpdate) {
  const signals = [];

  if (normalizeArray(artifacts).length > 0) {
    signals.push("first-file-generated");
  }

  if (executionResult.status === "completed" && normalizeArray(artifacts).length > 0) {
    signals.push("repo-created");
  }

  if (releaseStateUpdate.release?.status === "validated" || releaseStateUpdate.release?.status === "published") {
    signals.push("preview-ready");
  }

  if (releaseStateUpdate.release?.status === "blocked" || releaseStateUpdate.release?.status === "failed") {
    signals.push("deploy-blocked");
  }

  if (progressState.status === "done" || progressState.status === "active") {
    signals.push("project-advanced");
  }

  return [...new Set(signals)];
}

function buildUserFacingMilestones(realitySignals) {
  const milestones = [];

  if (realitySignals.includes("repo-created")) {
    milestones.push("A real project repo now exists");
  }

  if (realitySignals.includes("first-file-generated")) {
    milestones.push("The first visible project files were generated");
  }

  if (realitySignals.includes("preview-ready")) {
    milestones.push("A preview is ready to review");
  }

  if (realitySignals.includes("project-advanced")) {
    milestones.push("The project moved from planning into execution");
  }

  return milestones;
}

export function createProgressToRealityMapper({
  progressState = null,
  executionResult = null,
  artifacts = [],
  releaseStateUpdate = null,
} = {}) {
  const normalizedProgressState = normalizeObject(progressState);
  const normalizedExecutionResult = normalizeObject(executionResult);
  const normalizedArtifacts = normalizeArray(artifacts);
  const normalizedReleaseStateUpdate = normalizeObject(releaseStateUpdate);
  const realitySignals = inferRealitySignals(
    normalizedProgressState,
    normalizedExecutionResult,
    normalizedArtifacts,
    normalizedReleaseStateUpdate,
  );

  return {
    realityProgress: {
      realityProgressId: `reality-progress:${normalizedExecutionResult.requestId ?? normalizedExecutionResult.taskId ?? "unknown"}`,
      signals: realitySignals,
      userFacingMilestones: buildUserFacingMilestones(realitySignals),
      summary: {
        totalSignals: realitySignals.length,
        hasVisibleResult: realitySignals.some((signal) =>
          ["first-file-generated", "repo-created", "preview-ready"].includes(signal)
        ),
        releaseStatus: normalizedReleaseStateUpdate.release?.status ?? null,
        valueMoment: realitySignals.includes("preview-ready")
          ? "preview"
          : realitySignals.includes("repo-created")
            ? "repo"
            : realitySignals.includes("first-file-generated")
              ? "files"
              : "progress",
      },
    },
  };
}
