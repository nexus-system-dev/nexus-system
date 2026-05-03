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

function resolveDecision({ healthValidation, deploymentResult, releaseWorkspace }) {
  const blockedReasons = unique([
    ...normalizeArray(healthValidation.blockedReasons),
    healthValidation.summary?.canConfirmLaunch === true ? null : "production-health-unconfirmed",
    deploymentResult.summary?.isReadyForLaunchVerification === true ? null : "deployment-result-unready",
    releaseWorkspace.summary?.isBlocked === false ? null : "release-workspace-blocked",
  ]);
  return {
    decision: blockedReasons.length === 0 ? "confirmed" : "blocked",
    blockedReasons,
  };
}

export function createLaunchConfirmationState({
  productionHealthValidation = null,
  deploymentResultEnvelope = null,
  releaseWorkspace = null,
} = {}) {
  const healthValidation = normalizeObject(productionHealthValidation);
  const deploymentResult = normalizeObject(deploymentResultEnvelope);
  const workspace = normalizeObject(releaseWorkspace);
  const { decision, blockedReasons } = resolveDecision({
    healthValidation,
    deploymentResult,
    releaseWorkspace: workspace,
  });

  return {
    launchConfirmationState: {
      launchConfirmationStateId: `launch-confirmation:${normalizeString(deploymentResult.requestId, "unknown-deployment-request")}`,
      status: decision === "confirmed" ? "ready" : "blocked",
      decision,
      launchEnvironment: normalizeString(healthValidation.launchEnvironment, normalizeString(deploymentResult.environment, "staging")),
      releaseTarget: normalizeString(workspace.releaseTarget, null),
      confirmationPayload: {
        healthStatus: normalizeString(healthValidation.healthStatus, "unknown"),
        releaseStatus: normalizeString(healthValidation.releaseStatus, "active"),
        deploymentOutcome: normalizeString(deploymentResult.outcome, "pending"),
        workspaceStatus: normalizeString(workspace.buildAndDeploy?.currentStatus, "pending"),
      },
      blockedReasons,
      summary: {
        confirmed: decision === "confirmed",
        failedChecks: Number.isFinite(healthValidation.summary?.failedChecks) ? healthValidation.summary.failedChecks : 0,
        nextAction: decision === "confirmed" ? "proceed-to-readiness-evaluation" : "resolve-launch-blockers",
      },
    },
  };
}
