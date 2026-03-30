function normalizeActorType(actorType) {
  return typeof actorType === "string" && actorType.trim() ? actorType.trim().toLowerCase() : "viewer";
}

function normalizeProjectAction(projectAction) {
  if (typeof projectAction === "string" && projectAction.trim()) {
    return projectAction.trim().toLowerCase();
  }

  if (projectAction && typeof projectAction === "object") {
    return (
      projectAction.actionType
      ?? projectAction.type
      ?? projectAction.name
      ?? "view"
    ).toString().trim().toLowerCase();
  }

  return "view";
}

function normalizeRoleCapabilityMatrix(roleCapabilityMatrix) {
  return roleCapabilityMatrix && typeof roleCapabilityMatrix === "object" ? roleCapabilityMatrix : {};
}

function normalizePolicyDecision(policyDecision) {
  return policyDecision && typeof policyDecision === "object" ? policyDecision : {};
}

function mapActorToRole(actorType) {
  const mapping = {
    owner: "owner",
    admin: "owner",
    member: "member",
    editor: "member",
    operator: "operator",
    reviewer: "reviewer",
    viewer: "viewer",
    user: "viewer",
  };

  return mapping[actorType] ?? "viewer";
}

function mapActionToCapability(projectAction) {
  const mapping = {
    view: "view",
    inspect: "view",
    "code-edit": "edit",
    edit: "edit",
    update: "edit",
    run: "run",
    execute: "run",
    "release-approval": "approve",
    approve: "approve",
    deploy: "deploy",
    "credential-link": "connectAccounts",
    "connect-account": "connectAccounts",
    "connect-accounts": "connectAccounts",
    "manage-credentials": "manageCredentials",
    "credential-use": "manageCredentials",
  };

  return mapping[projectAction] ?? "view";
}

function resolveRoleEntry(roleCapabilityMatrix, role) {
  const entries = Array.isArray(roleCapabilityMatrix.roles) ? roleCapabilityMatrix.roles : [];
  return entries.find((entry) => entry?.role === role) ?? entries.find((entry) => entry?.role === "viewer") ?? null;
}

function buildChecks(projectAction, capabilityKey, capabilities, policyDecision) {
  const checks = [];

  if (capabilities?.[capabilityKey] !== true) {
    checks.push("role-capability-missing");
  }

  if (policyDecision.isBlocked === true) {
    checks.push("policy-blocked");
  }

  if (policyDecision.requiresApproval === true && projectAction !== "view") {
    checks.push("policy-requires-approval");
  }

  if (projectAction === "deploy") {
    checks.push("privileged-deploy-action");
  }

  if (capabilityKey === "manageCredentials" || capabilityKey === "connectAccounts") {
    checks.push("integration-sensitive-action");
  }

  return checks;
}

export function createActionLevelProjectAuthorizationResolver({
  actorType = null,
  projectAction = null,
  roleCapabilityMatrix = null,
  policyDecision = null,
} = {}) {
  const normalizedActorType = normalizeActorType(actorType);
  const normalizedProjectAction = normalizeProjectAction(projectAction);
  const normalizedRoleCapabilityMatrix = normalizeRoleCapabilityMatrix(roleCapabilityMatrix);
  const normalizedPolicyDecision = normalizePolicyDecision(policyDecision);
  const effectiveRole = mapActorToRole(normalizedActorType);
  const roleEntry = resolveRoleEntry(normalizedRoleCapabilityMatrix, effectiveRole);
  const capabilityKey = mapActionToCapability(normalizedProjectAction);
  const capabilities = roleEntry?.capabilities ?? {};
  const checks = buildChecks(
    normalizedProjectAction,
    capabilityKey,
    capabilities,
    normalizedPolicyDecision,
  );

  let decision = capabilities?.[capabilityKey] === true ? "allowed" : "blocked";
  if (normalizedPolicyDecision.isBlocked === true) {
    decision = "blocked";
  } else if (
    normalizedPolicyDecision.requiresApproval === true
    && normalizedProjectAction !== "view"
    && capabilities?.[capabilityKey] === true
  ) {
    decision = "requires-approval";
  }

  return {
    projectAuthorizationDecision: {
      authorizationDecisionId: `project-authorization:${normalizedActorType}:${normalizedProjectAction}`,
      actorType: normalizedActorType,
      effectiveRole,
      projectAction: normalizedProjectAction,
      requiredCapability: capabilityKey,
      decision,
      isAllowed: decision === "allowed",
      requiresApproval: decision === "requires-approval",
      isBlocked: decision === "blocked",
      allowedActions: roleEntry?.allowedActions ?? [],
      checks,
      reason:
        decision === "blocked"
          ? normalizedPolicyDecision.reason
            ?? `Role ${effectiveRole} cannot perform ${normalizedProjectAction}`
          : decision === "requires-approval"
            ? normalizedPolicyDecision.reason ?? `${normalizedProjectAction} requires approval by policy`
            : `Role ${effectiveRole} can perform ${normalizedProjectAction}`,
    },
  };
}
