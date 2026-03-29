function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function mapIntake(projectIntake) {
  return {
    projectName: projectIntake.projectName ?? null,
    visionText: projectIntake.visionText ?? null,
    projectType: projectIntake.projectType ?? "unknown",
    requestedDeliverables: normalizeArray(projectIntake.requestedDeliverables),
    uploadedFiles: normalizeArray(projectIntake.uploadedFiles),
    externalLinks: normalizeArray(projectIntake.externalLinks),
  };
}

function mapOwnership(initialProjectState) {
  return {
    ownerUserId: initialProjectState.ownership?.ownerUserId ?? null,
    workspaceId: initialProjectState.ownership?.workspaceId ?? null,
    role: initialProjectState.ownership?.role ?? "owner",
  };
}

export function createOnboardingToStateTransformationMapper({
  onboardingStateHandoff = null,
  initialProjectState = null,
} = {}) {
  const normalizedHandoff = normalizeObject(onboardingStateHandoff);
  const normalizedState = normalizeObject(initialProjectState);
  const approvals = normalizeArray(normalizedHandoff.approvals);
  const missingClarifications = normalizeArray(normalizedHandoff.missingClarifications);
  const mappedIntake = mapIntake(normalizedHandoff.projectIntake ?? {});
  const mappedOwnership = mapOwnership(normalizedState);

  return {
    stateBootstrapPayload: {
      payloadId: `state-bootstrap:${normalizedState.stateId ?? normalizedHandoff.handoffId ?? "unknown"}`,
      sourceHandoffId: normalizedHandoff.handoffId ?? null,
      initialProjectStateId: normalizedState.stateId ?? null,
      identity: normalizeObject(normalizedState.identity),
      goals: normalizeObject(normalizedState.goals),
      constraints: normalizeObject(normalizedState.constraints),
      readiness: normalizeObject(normalizedState.readiness),
      ownership: mappedOwnership,
      bootstrapMetadata: {
        ...normalizeObject(normalizedState.bootstrapMetadata),
        approvalCount: approvals.length,
        missingClarificationCount: missingClarifications.length,
      },
      intake: mappedIntake,
      approvals,
      draftMetadata: normalizeObject(normalizedHandoff.projectDraft),
      missingClarifications,
      summary: {
        canBootstrap:
          normalizedState.readiness?.canBootstrap === true
          && missingClarifications.length === 0
          && Boolean(mappedOwnership.ownerUserId)
          && Boolean(mappedOwnership.workspaceId),
        hasApprovals: approvals.length > 0,
        hasMissingClarifications: missingClarifications.length > 0,
      },
    },
  };
}
