function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildIdentity(projectIdentity, minimumViableState) {
  return {
    identityId: projectIdentity.identityId ?? `initial-project-identity:${minimumViableState.projectId ?? "unknown"}`,
    projectId: minimumViableState.projectId ?? null,
    name: projectIdentity.name ?? minimumViableState.projectName ?? "New Project",
    vision: projectIdentity.vision ?? minimumViableState.businessGoal ?? "",
    audience: projectIdentity.audience ?? "early users",
    tone: projectIdentity.tone ?? "clear",
  };
}

function buildGoals(projectIdentity, minimumViableState, requestedDeliverables) {
  return {
    businessGoal: minimumViableState.businessGoal ?? projectIdentity.vision ?? "",
    successDefinition: projectIdentity.successDefinition ?? "Reach a clear first working outcome",
    requestedDeliverables,
    projectType: minimumViableState.projectType ?? "unknown",
  };
}

export function defineCanonicalInitialProjectStateSchema({
  initialProjectStateContract = null,
  projectIdentity = null,
} = {}) {
  const normalizedContract = normalizeObject(initialProjectStateContract);
  const normalizedIdentity = normalizeObject(projectIdentity);
  const minimumViableState = normalizeObject(normalizedContract.minimumViableState);
  const requestedDeliverables = normalizeArray(normalizedContract.optionalMetadata?.requestedDeliverables);
  const missingClarifications = normalizeArray(normalizedContract.optionalMetadata?.missingClarifications);

  return {
    initialProjectState: {
      stateId: `initial-project-state:${minimumViableState.projectId ?? normalizedContract.contractId ?? "unknown"}`,
      identity: buildIdentity(normalizedIdentity, minimumViableState),
      goals: buildGoals(normalizedIdentity, minimumViableState, requestedDeliverables),
      constraints: {
        missingClarifications,
        requiredInputs: normalizeArray(normalizedContract.requiredInputs),
        readinessRequirements: normalizeArray(normalizedContract.readiness?.missingRequirements),
      },
      readiness: {
        status: normalizedContract.readiness?.isReady === true ? "ready" : "blocked",
        canBootstrap: normalizedContract.readiness?.canBootstrapState === true,
        missingRequirementCount: normalizeArray(normalizedContract.readiness?.missingRequirements).length,
      },
      ownership: {
        ownerUserId: minimumViableState.ownerUserId ?? null,
        workspaceId: minimumViableState.workspaceId ?? null,
        role: normalizedContract.optionalMetadata?.ownershipRole ?? "owner",
      },
      bootstrapMetadata: {
        approvals: normalizeArray(normalizedContract.optionalMetadata?.approvals),
        bootstrapMetadata: normalizeObject(normalizedContract.optionalMetadata?.bootstrapMetadata),
        requestedDeliverables,
        sourceHandoffId: normalizedContract.sourceHandoffId ?? null,
      },
      summary: {
        isCanonical: true,
        hasOwnership: Boolean(minimumViableState.ownerUserId && minimumViableState.workspaceId),
        hasRequestedDeliverables: requestedDeliverables.length > 0,
        isReadyForBootstrap: normalizedContract.readiness?.canBootstrapState === true,
      },
    },
  };
}
