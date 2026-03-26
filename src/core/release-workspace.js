function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function createReleaseWorkspace({
  releasePlan = null,
  validationReport = null,
  releaseTimeline = null,
  releaseStatus = null,
  deploymentRequest = null,
  qualityGateDecision = null,
} = {}) {
  const normalizedReleasePlan = normalizeObject(releasePlan);
  const normalizedValidationReport = normalizeObject(validationReport);
  const normalizedReleaseTimeline = normalizeObject(releaseTimeline);
  const normalizedReleaseStatus = normalizeObject(releaseStatus);
  const normalizedDeploymentRequest = normalizeObject(deploymentRequest);
  const normalizedQualityGateDecision = normalizeObject(qualityGateDecision);

  const events = normalizeArray(normalizedReleaseTimeline.events);
  const environments = normalizeArray(normalizedReleasePlan.environments);
  const blockers = normalizeArray(normalizedValidationReport.blockingIssues);

  return {
    releaseWorkspace: {
      workspaceId:
        normalizedReleaseTimeline.releaseRunId
        ?? normalizedReleaseStatus.releaseRunId
        ?? `release-workspace:${normalizedReleasePlan.releaseTarget ?? "unknown"}`,
      releaseTarget: normalizedReleasePlan.releaseTarget ?? null,
      buildAndDeploy: {
        releaseTag: normalizedReleasePlan.releaseTag ?? null,
        currentStage:
          normalizedReleaseTimeline.currentStage
          ?? normalizedReleaseStatus.currentStage
          ?? "planned",
        currentStatus:
          normalizedReleaseTimeline.currentStatus
          ?? normalizedReleaseStatus.status
          ?? "pending",
        environments,
      },
      validation: {
        status: normalizedValidationReport.status ?? "unknown",
        isReady: normalizedValidationReport.isReady ?? false,
        blockers,
        qualityGateDecision: normalizedQualityGateDecision.decision ?? null,
      },
      deployment: {
        provider: normalizedDeploymentRequest.provider ?? null,
        target: normalizedDeploymentRequest.target ?? normalizedReleasePlan.releaseTarget ?? null,
        strategy: normalizedDeploymentRequest.strategy ?? null,
        requiresApproval: normalizedDeploymentRequest.requiresApproval ?? false,
      },
      timeline: {
        currentStage: normalizedReleaseTimeline.currentStage ?? null,
        currentStatus: normalizedReleaseTimeline.currentStatus ?? null,
        eventCount: normalizedReleaseTimeline.eventCount ?? events.length,
        events,
      },
      summary: {
        isBlocked: blockers.length > 0 || normalizedValidationReport.isReady === false,
        terminal: normalizedReleaseStatus.terminalStates?.includes?.(normalizedReleaseStatus.status) ?? false,
        totalEnvironments: environments.length,
        totalEvents: events.length,
      },
    },
  };
}
