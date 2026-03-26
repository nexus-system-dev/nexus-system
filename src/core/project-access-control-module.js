function normalizeWorkspaceModel(workspaceModel) {
  return workspaceModel && typeof workspaceModel === "object" ? workspaceModel : {};
}

function normalizeMembershipRecord(membershipRecord) {
  return membershipRecord && typeof membershipRecord === "object" ? membershipRecord : {};
}

function normalizeProjectId(projectId) {
  return typeof projectId === "string" && projectId.trim() ? projectId : "unknown-project";
}

function normalizeActorType(actorType) {
  return typeof actorType === "string" && actorType.trim() ? actorType.trim().toLowerCase() : "viewer";
}

function resolveAllowedActions(role, policyDecision) {
  const baseByRole = {
    owner: ["view", "edit", "run", "approve", "deploy", "manage"],
    admin: ["view", "edit", "run", "approve", "deploy"],
    editor: ["view", "edit", "run"],
    operator: ["view", "run"],
    viewer: ["view"],
  };

  const allowedActions = [...(baseByRole[role] ?? baseByRole.viewer)];
  if (policyDecision?.isBlocked === true) {
    return ["view"];
  }

  if (policyDecision?.requiresApproval === true && !allowedActions.includes("approve")) {
    allowedActions.push("request-approval");
  }

  return allowedActions;
}

export function createProjectAccessControlModule({
  workspaceModel = null,
  membershipRecord = null,
  projectId,
  actorType,
  policyDecision = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeWorkspaceModel(workspaceModel);
  const normalizedMembershipRecord = normalizeMembershipRecord(membershipRecord);
  const normalizedProjectId = normalizeProjectId(projectId);
  const normalizedActorType = normalizeActorType(actorType);
  const effectiveRole = normalizedMembershipRecord.role ?? normalizedActorType;
  const allowedActions = resolveAllowedActions(effectiveRole, policyDecision);
  const canView = allowedActions.includes("view");
  const canEdit = allowedActions.includes("edit");
  const canRun = allowedActions.includes("run");
  const canApprove = allowedActions.includes("approve");
  const canDeploy = allowedActions.includes("deploy");
  const decision = policyDecision?.isBlocked === true
    ? "blocked"
    : canView
      ? "allowed"
      : "restricted";

  return {
    accessDecision: {
      projectId: normalizedProjectId,
      workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
      actorType: normalizedActorType,
      effectiveRole,
      decision,
      canView,
      canEdit,
      canRun,
      canApprove,
      canDeploy,
      requiresApproval: policyDecision?.requiresApproval === true && !canApprove,
      allowedActions,
      reason: decision === "blocked"
        ? policyDecision?.reason ?? "Project access is blocked by policy"
        : canView
          ? `Project access granted for ${effectiveRole}`
          : `Project access is restricted for ${effectiveRole}`,
    },
  };
}
