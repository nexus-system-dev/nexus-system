function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function unique(values = []) {
  return [...new Set(normalizeArray(values))];
}

function buildChecks({ launchConfirmationState, productionHealthValidation, deploymentResultEnvelope, releaseWorkspace }) {
  return [
    {
      checkId: "launch-confirmed",
      status: launchConfirmationState.summary?.confirmed === true ? "passed" : "failed",
      reason: launchConfirmationState.summary?.confirmed === true ? null : "launch-unconfirmed",
    },
    {
      checkId: "production-health-ready",
      status: productionHealthValidation.summary?.canConfirmLaunch === true ? "passed" : "failed",
      reason: productionHealthValidation.summary?.canConfirmLaunch === true ? null : "production-health-unready",
    },
    {
      checkId: "deployment-result-ready",
      status: deploymentResultEnvelope.summary?.isReadyForLaunchVerification === true ? "passed" : "failed",
      reason: deploymentResultEnvelope.summary?.isReadyForLaunchVerification === true ? null : "deployment-result-unready",
    },
    {
      checkId: "release-workspace-clear",
      status: releaseWorkspace.summary?.isBlocked === false ? "passed" : "failed",
      reason: releaseWorkspace.summary?.isBlocked === false ? null : "release-workspace-blocked",
    },
  ];
}

export function createReleaseReadinessEvaluator({
  launchConfirmationState = null,
  productionHealthValidation = null,
  deploymentResultEnvelope = null,
  releaseWorkspace = null,
} = {}) {
  const launch = normalizeObject(launchConfirmationState);
  const health = normalizeObject(productionHealthValidation);
  const deployment = normalizeObject(deploymentResultEnvelope);
  const workspace = normalizeObject(releaseWorkspace);
  const checks = buildChecks({
    launchConfirmationState: launch,
    productionHealthValidation: health,
    deploymentResultEnvelope: deployment,
    releaseWorkspace: workspace,
  });
  const blockedReasons = unique(checks.filter((check) => check.status === "failed").map((check) => check.reason));
  const passedChecks = checks.filter((check) => check.status === "passed").length;
  const readinessScore = checks.length === 0 ? 0 : Math.round((passedChecks / checks.length) * 100);

  return {
    releaseReadinessEvaluation: {
      releaseReadinessEvaluationId: `release-readiness:${normalizeString(deployment.requestId, "unknown-deployment-request")}`,
      status: blockedReasons.length === 0 ? "ready" : "blocked",
      readinessDecision: blockedReasons.length === 0 ? "launch-ready" : "not-ready",
      launchEnvironment: normalizeString(launch.launchEnvironment, normalizeString(deployment.environment, "staging")),
      releaseTarget: normalizeString(launch.releaseTarget, normalizeString(workspace.releaseTarget, null)),
      checks,
      blockedReasons,
      summary: {
        readinessScore,
        passedChecks,
        failedChecks: checks.length - passedChecks,
        nextAction: blockedReasons.length === 0 ? "launch-approved" : "resolve-release-readiness-gaps",
      },
    },
  };
}
