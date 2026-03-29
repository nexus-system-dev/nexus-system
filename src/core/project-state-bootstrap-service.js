import { defineProjectStateSnapshotSchema } from "./project-state-snapshot-schema.js";

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildBootstrappedState(stateBootstrapPayload, projectOwnershipBinding) {
  const ownership = normalizeObject(stateBootstrapPayload.ownership);
  const binding = normalizeObject(projectOwnershipBinding);
  const readiness = normalizeObject(stateBootstrapPayload.readiness);

  return {
    stateId: stateBootstrapPayload.initialProjectStateId ?? `initial-project-state:${binding.projectId ?? "unknown-project"}`,
    projectId:
      stateBootstrapPayload.identity?.projectId
      ?? stateBootstrapPayload.draftMetadata?.draftId
      ?? binding.projectId
      ?? "unknown-project",
    workspaceId: ownership.workspaceId ?? binding.workspaceId ?? null,
    ownerUserId: ownership.ownerUserId ?? binding.ownerUserId ?? null,
    workspaceArea: "developer-workspace",
    workspaceVisibility: "workspace",
    lifecyclePhase: readiness.canBootstrap === true ? "bootstrap-ready" : "bootstrap-blocked",
    approvalStatus: normalizeArray(stateBootstrapPayload.approvals).length > 0 ? "approved" : "missing",
    hasArtifacts: false,
    hasBlockers: stateBootstrapPayload.summary?.canBootstrap !== true,
    updatedAt: new Date().toISOString(),
    artifactCount: 0,
    outputPaths: [],
    packageFormat: null,
    packagedFileCount: 0,
    verificationStatus: readiness.canBootstrap === true ? "ready" : "blocked",
    identity: normalizeObject(stateBootstrapPayload.identity),
    goals: normalizeObject(stateBootstrapPayload.goals),
    constraints: normalizeObject(stateBootstrapPayload.constraints),
    readiness,
    ownership: {
      ownerUserId: ownership.ownerUserId ?? binding.ownerUserId ?? null,
      workspaceId: ownership.workspaceId ?? binding.workspaceId ?? null,
      role: ownership.role ?? binding.role ?? "owner",
    },
    bootstrapMetadata: {
      ...normalizeObject(stateBootstrapPayload.bootstrapMetadata),
      sourceHandoffId: stateBootstrapPayload.sourceHandoffId ?? null,
    },
    summary: {
      isCanonical: true,
      hasOwnership: Boolean(
        (ownership.ownerUserId ?? binding.ownerUserId)
        && (ownership.workspaceId ?? binding.workspaceId),
      ),
      isReadyForBootstrap: readiness.canBootstrap === true,
    },
    approvals: normalizeArray(stateBootstrapPayload.approvals),
    missingClarifications: normalizeArray(stateBootstrapPayload.missingClarifications),
    intake: normalizeObject(stateBootstrapPayload.intake),
    draftMetadata: normalizeObject(stateBootstrapPayload.draftMetadata),
    stateVersion: 1,
    executionGraphVersion: 1,
  };
}

export function createProjectStateBootstrapService({
  stateBootstrapPayload = null,
  projectOwnershipBinding = null,
} = {}) {
  const normalizedPayload = normalizeObject(stateBootstrapPayload);
  const normalizedBinding = normalizeObject(projectOwnershipBinding);
  const initialProjectState = buildBootstrappedState(normalizedPayload, normalizedBinding);
  const { projectStateSnapshot } = defineProjectStateSnapshotSchema({
    projectState: initialProjectState,
    executionGraph: {
      nodes: [],
      edges: [],
    },
  });

  return {
    initialProjectState,
    projectStateSnapshot,
  };
}
