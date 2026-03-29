function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function createIssue(code, field, severity, message) {
  return {
    code,
    field,
    severity,
    message,
  };
}

function collectRequiredFieldIssues(initialProjectState) {
  const state = normalizeObject(initialProjectState);
  const issues = [];

  if (!state.stateId) {
    issues.push(createIssue("missing-state-id", "stateId", "error", "Initial project state is missing stateId"));
  }

  if (!state.projectId && !state.identity?.projectId) {
    issues.push(createIssue("missing-project-id", "projectId", "error", "Initial project state is missing projectId"));
  }

  if (!state.identity?.projectId) {
    issues.push(createIssue("missing-identity-project-id", "identity.projectId", "error", "Identity is missing projectId"));
  }

  if (!state.identity?.name) {
    issues.push(createIssue("missing-project-name", "identity.name", "error", "Identity is missing project name"));
  }

  if (!state.goals?.businessGoal) {
    issues.push(createIssue("missing-business-goal", "goals.businessGoal", "error", "Goals are missing business goal"));
  }

  return issues;
}

function collectOwnershipIssues(initialProjectState) {
  const state = normalizeObject(initialProjectState);
  const issues = [];

  if (!state.ownership?.ownerUserId) {
    issues.push(createIssue("missing-owner-user-id", "ownership.ownerUserId", "error", "Ownership is missing ownerUserId"));
  }

  if (!state.ownership?.workspaceId) {
    issues.push(createIssue("missing-workspace-id", "ownership.workspaceId", "error", "Ownership is missing workspaceId"));
  }

  if (state.ownerUserId && state.ownership?.ownerUserId && state.ownerUserId !== state.ownership.ownerUserId) {
    issues.push(createIssue("owner-user-id-mismatch", "ownership.ownerUserId", "error", "Root ownerUserId does not match ownership binding"));
  }

  if (state.workspaceId && state.ownership?.workspaceId && state.workspaceId !== state.ownership.workspaceId) {
    issues.push(createIssue("workspace-id-mismatch", "ownership.workspaceId", "error", "Root workspaceId does not match ownership binding"));
  }

  return issues;
}

function collectReadinessIssues(initialProjectState, initialProjectStateContract) {
  const state = normalizeObject(initialProjectState);
  const contract = normalizeObject(initialProjectStateContract);
  const readiness = normalizeObject(state.readiness);
  const contractReadiness = normalizeObject(contract.readiness);
  const issues = [];
  const missingRequirements = normalizeArray(contractReadiness.missingRequirements);

  if (typeof readiness.canBootstrap !== "boolean") {
    issues.push(createIssue("missing-can-bootstrap", "readiness.canBootstrap", "error", "Readiness is missing canBootstrap"));
  }

  if (!readiness.status) {
    issues.push(createIssue("missing-readiness-status", "readiness.status", "error", "Readiness is missing status"));
  }

  if ((state.summary?.isReadyForBootstrap ?? null) !== readiness.canBootstrap) {
    issues.push(createIssue("summary-readiness-mismatch", "summary.isReadyForBootstrap", "error", "Summary readiness does not match readiness.canBootstrap"));
  }

  if (readiness.canBootstrap === true && missingRequirements.length > 0) {
    issues.push(createIssue("bootstrap-with-missing-requirements", "readiness.canBootstrap", "error", "State is marked bootstrappable while contract still has missing requirements"));
  }

  if (readiness.canBootstrap === false && readiness.status === "ready") {
    issues.push(createIssue("blocked-ready-mismatch", "readiness.status", "error", "State cannot be ready when bootstrap is blocked"));
  }

  return issues;
}

function collectConsistencyIssues(initialProjectState, initialProjectStateContract) {
  const state = normalizeObject(initialProjectState);
  const contract = normalizeObject(initialProjectStateContract);
  const issues = [];
  const requiredInputs = normalizeArray(contract.requiredInputs);
  const readinessRequirements = normalizeArray(contract.readiness?.missingRequirements);

  if (state.projectId && state.identity?.projectId && state.projectId !== state.identity.projectId) {
    issues.push(createIssue("project-id-mismatch", "identity.projectId", "error", "Root projectId does not match identity.projectId"));
  }

  if ((state.summary?.hasOwnership ?? null) !== Boolean(state.ownership?.ownerUserId && state.ownership?.workspaceId)) {
    issues.push(createIssue("summary-ownership-mismatch", "summary.hasOwnership", "error", "Summary ownership does not match ownership data"));
  }

  if ((state.constraints?.requiredInputs?.length ?? 0) !== requiredInputs.length) {
    issues.push(createIssue("required-inputs-mismatch", "constraints.requiredInputs", "warning", "Required inputs do not match the initial state contract"));
  }

  if ((state.constraints?.readinessRequirements?.length ?? 0) !== readinessRequirements.length) {
    issues.push(createIssue("readiness-requirements-mismatch", "constraints.readinessRequirements", "warning", "Readiness requirements do not match the initial state contract"));
  }

  return issues;
}

export function createInitialProjectStateValidationModule({
  initialProjectState = null,
  initialProjectStateContract = null,
} = {}) {
  const state = normalizeObject(initialProjectState);
  const contract = normalizeObject(initialProjectStateContract);
  const stateValidationIssues = [
    ...collectRequiredFieldIssues(state),
    ...collectOwnershipIssues(state),
    ...collectReadinessIssues(state, contract),
    ...collectConsistencyIssues(state, contract),
  ];
  const blockingIssues = stateValidationIssues.filter((issue) => issue.severity === "error");

  return {
    initialProjectStateValidation: {
      isValid: blockingIssues.length === 0,
      checkedAt: new Date().toISOString(),
      checkedFields: [
        "stateId",
        "identity",
        "goals",
        "ownership",
        "readiness",
        "constraints",
        "summary",
      ],
      blockingIssueCount: blockingIssues.length,
      warningCount: stateValidationIssues.length - blockingIssues.length,
      summary: {
        hasCanonicalSchema: state.summary?.isCanonical === true,
        hasOwnershipBinding: Boolean(state.ownership?.ownerUserId && state.ownership?.workspaceId),
        hasReadinessMetadata: typeof state.readiness?.canBootstrap === "boolean" && Boolean(state.readiness?.status),
        isStateConsistent: stateValidationIssues.length === 0,
      },
    },
    stateValidationIssues,
  };
}
