function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function deriveRequiredInputs(onboardingStateHandoff, projectOwnershipBinding) {
  const requiredInputs = ["project-draft", "project-intake", "ownership-binding"];

  if (!onboardingStateHandoff.projectIntake?.visionText) {
    requiredInputs.push("vision");
  }
  if (!onboardingStateHandoff.projectIntake?.projectName) {
    requiredInputs.push("project-name");
  }
  if (!projectOwnershipBinding.ownerUserId) {
    requiredInputs.push("owner-user-id");
  }
  if (!projectOwnershipBinding.workspaceId) {
    requiredInputs.push("workspace-id");
  }

  return [...new Set(requiredInputs)];
}

function buildMinimumViableState(onboardingStateHandoff, projectOwnershipBinding) {
  return {
    projectId: onboardingStateHandoff.projectDraft?.draftId ?? null,
    projectName: onboardingStateHandoff.projectIntake?.projectName ?? onboardingStateHandoff.projectDraft?.name ?? null,
    businessGoal: onboardingStateHandoff.projectIntake?.visionText ?? null,
    projectType: onboardingStateHandoff.projectIntake?.projectType ?? "unknown",
    ownerUserId: projectOwnershipBinding.ownerUserId ?? null,
    workspaceId: projectOwnershipBinding.workspaceId ?? null,
    readiness: onboardingStateHandoff.completionDecision?.isComplete === true ? "ready" : "blocked",
  };
}

export function defineInitialProjectStateCreationContract({
  onboardingStateHandoff = null,
  projectOwnershipBinding = null,
} = {}) {
  const normalizedHandoff = normalizeObject(onboardingStateHandoff);
  const normalizedOwnership = normalizeObject(projectOwnershipBinding);
  const requiredInputs = deriveRequiredInputs(normalizedHandoff, normalizedOwnership);
  const optionalMetadata = {
    approvals: normalizeArray(normalizedHandoff.approvals),
    requestedDeliverables: normalizeArray(normalizedHandoff.projectIntake?.requestedDeliverables),
    bootstrapMetadata: normalizeObject(normalizedHandoff.projectDraft?.bootstrapMetadata),
    missingClarifications: normalizeArray(normalizedHandoff.missingClarifications),
    ownershipRole: normalizedOwnership.role ?? null,
  };
  const minimumViableState = buildMinimumViableState(normalizedHandoff, normalizedOwnership);
  const isReady =
    normalizedHandoff.summary?.canBuildProjectState === true
    && Boolean(normalizedOwnership.ownerUserId)
    && Boolean(normalizedOwnership.workspaceId);

  return {
    initialProjectStateContract: {
      contractId: `initial-project-state-contract:${minimumViableState.projectId ?? normalizedOwnership.projectId ?? "unknown"}`,
      sourceHandoffId: normalizedHandoff.handoffId ?? null,
      requiredInputs,
      optionalMetadata,
      minimumViableState,
      readiness: {
        isReady,
        canBootstrapState: isReady,
        missingRequirements: isReady
          ? []
          : requiredInputs.filter((input) => ["vision", "project-name", "owner-user-id", "workspace-id"].includes(input)),
      },
      summary: {
        hasOwnershipBinding: Boolean(normalizedOwnership.ownerUserId && normalizedOwnership.workspaceId),
        approvalCount: optionalMetadata.approvals.length,
        missingClarificationCount: optionalMetadata.missingClarifications.length,
        requestedDeliverableCount: optionalMetadata.requestedDeliverables.length,
      },
    },
  };
}
