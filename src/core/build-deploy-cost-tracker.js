function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function resolveRunnerMultiplier(selectedMode) {
  switch (selectedMode) {
    case "xcode":
      return 4;
    case "ci-runner":
      return 2;
    case "container":
    case "agent":
    case "sandbox":
    case "local-terminal":
    default:
      return 1;
  }
}

function resolveQuantity(buildArtifacts, releaseStateUpdate, selectedMode) {
  const artifactCount = buildArtifacts.length;
  const deployAttemptCount = normalizeString(releaseStateUpdate.release?.status) ? 1 : 0;
  if (artifactCount === 0 && deployAttemptCount === 0) {
    return null;
  }

  return (artifactCount + deployAttemptCount) * resolveRunnerMultiplier(selectedMode);
}

export function createBuildDeployCostTracker({
  projectId = null,
  workspaceId = null,
  buildArtifact = null,
  deploymentResult = null,
  executionModeDecision = null,
  pricingMetadata = null,
} = {}) {
  const buildArtifacts = normalizeArray(buildArtifact);
  const normalizedDeploymentResult = normalizeObject(deploymentResult);
  const normalizedExecutionModeDecision = normalizeObject(executionModeDecision);
  const normalizedPricingMetadata = normalizeObject(pricingMetadata);
  const selectedMode = normalizeString(normalizedExecutionModeDecision.selectedMode) ?? "sandbox";
  const selectedSource = normalizeString(normalizedExecutionModeDecision.selectedSource) ?? selectedMode;
  const quantity = resolveQuantity(buildArtifacts, normalizedDeploymentResult, selectedMode);
  const unitPrice = normalizeFiniteNumber(
    normalizedPricingMetadata.buildDeployUnitPrice
    ?? normalizedPricingMetadata.buildUnitPrice
    ?? normalizedPricingMetadata.unitPrice,
  );
  const currency = normalizeString(normalizedPricingMetadata.currency)?.toLowerCase() ?? "usd";
  const totalCost = quantity !== null && unitPrice !== null ? quantity * unitPrice : null;
  const recordedAt =
    normalizeString(normalizedDeploymentResult.release?.updatedAt)
    ?? normalizeString(normalizedDeploymentResult.release?.recordedAt)
    ?? new Date().toISOString();

  return {
    buildDeployCostMetric: {
      buildDeployCostMetricId: `build-deploy-cost:${normalizeString(projectId) ?? "unknown-project"}:${recordedAt}`,
      usageType: "build",
      quantity,
      unit: "build-minute",
      totalCost,
      currency,
      unitPrice,
      projectId: normalizeString(projectId),
      workspaceId: normalizeString(workspaceId),
      source: selectedSource,
      executionMode: selectedMode,
      buildArtifactCount: buildArtifacts.length,
      deployAttemptCount: normalizeString(normalizedDeploymentResult.release?.status) ? 1 : 0,
      deploymentStatus: normalizeString(normalizedDeploymentResult.release?.status),
      recordedAt,
      summary:
        quantity === null
          ? "Build/deploy cost metric could not resolve billable build or deploy activity from available runtime evidence."
          : "Build/deploy cost metric calculated from build artifacts, release activity, and execution mode.",
    },
  };
}
