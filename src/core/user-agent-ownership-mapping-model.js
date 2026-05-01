function normalizeArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function collectAgentIds(taskExecutionMetric = null, taskResults = []) {
  const metricEntries = normalizeArray(normalizeObject(taskExecutionMetric).entries);
  const ids = new Set();

  for (const entry of metricEntries) {
    const agentId = normalizeString(entry?.agentId);
    if (agentId) {
      ids.add(agentId);
    }
  }

  for (const result of normalizeArray(taskResults)) {
    const agentId = normalizeString(result?.agentId);
    if (agentId) {
      ids.add(agentId);
    }
  }

  return [...ids];
}

function inferAgentType(agentId) {
  const normalized = normalizeString(agentId);
  if (!normalized) {
    return null;
  }

  if (normalized.includes("dev")) {
    return "development-agent";
  }

  if (normalized.includes("marketing")) {
    return "marketing-agent";
  }

  if (normalized.includes("qa")) {
    return "qa-agent";
  }

  return "automation-agent";
}

function buildHumanUserRecord({
  userIdentity,
  workspaceModel,
  membershipRecord,
  projectOwnershipBinding,
  ownerAuthState,
} = {}) {
  const identity = normalizeObject(userIdentity);
  const workspace = normalizeObject(workspaceModel);
  const membership = normalizeObject(membershipRecord);
  const binding = normalizeObject(projectOwnershipBinding);
  const ownerAuth = normalizeObject(ownerAuthState);
  const userId = normalizeString(identity.userId) ?? normalizeString(membership.userId) ?? normalizeString(binding.ownerUserId);

  return {
    humanUserId: userId,
    workspaceId: normalizeString(workspace.workspaceId) ?? normalizeString(binding.workspaceId),
    membershipId: normalizeString(membership.membershipId),
    projectId: normalizeString(binding.projectId),
    role: normalizeString(membership.role) ?? normalizeString(binding.role) ?? "owner",
    roles: normalizeArray(membership.roles).map((role) => normalizeString(role)).filter(Boolean),
    isOwner:
      membership.isOwner === true
      || (normalizeString(workspace.ownerUserId) !== null && normalizeString(workspace.ownerUserId) === userId),
    trustLevel: normalizeString(ownerAuth.trustLevel) ?? "unknown",
    isAuthenticated: ownerAuth.isAuthenticated === true,
  };
}

export function createUserAgentOwnershipMappingModel({
  projectId = null,
  userIdentity = null,
  workspaceModel = null,
  membershipRecord = null,
  projectOwnershipBinding = null,
  ownerAuthState = null,
  taskExecutionMetric = null,
  taskResults = [],
} = {}) {
  const humanUser = buildHumanUserRecord({
    userIdentity,
    workspaceModel,
    membershipRecord,
    projectOwnershipBinding,
    ownerAuthState,
  });
  const ownerUserId = normalizeString(humanUser.humanUserId) ?? normalizeString(projectOwnershipBinding?.ownerUserId);
  const workspaceId = normalizeString(humanUser.workspaceId) ?? normalizeString(workspaceModel?.workspaceId);
  const normalizedProjectId = normalizeString(projectId) ?? normalizeString(projectOwnershipBinding?.projectId);
  const agentIds = collectAgentIds(taskExecutionMetric, taskResults);
  const agentMappings = agentIds.map((agentId) => ({
    mappingId: `user-agent-mapping:${normalizedProjectId ?? "unknown-project"}:${agentId}`,
    agentId,
    agentType: inferAgentType(agentId),
    humanUserId: ownerUserId,
    ownerUserId,
    workspaceId,
    projectId: normalizedProjectId,
    relationship: "delegated-agent",
    mappingStatus: ownerUserId ? "owned" : "unresolved-owner",
  }));

  return {
    userAgentMapping: {
      userAgentMappingId: `user-agent-mapping:${normalizedProjectId ?? workspaceId ?? ownerUserId ?? "unknown"}`,
      status: ownerUserId && workspaceId ? "ready" : "missing-inputs",
      ownerUserId,
      workspaceId,
      projectId: normalizedProjectId,
      humanUsers: ownerUserId ? [humanUser] : [],
      agentMappings,
      byAgent: Object.fromEntries(agentMappings.map((mapping) => [
        mapping.agentId,
        {
          humanUserId: mapping.humanUserId,
          ownerUserId: mapping.ownerUserId,
          workspaceId: mapping.workspaceId,
          projectId: mapping.projectId,
          relationship: mapping.relationship,
          mappingStatus: mapping.mappingStatus,
        },
      ])),
      summary: {
        totalHumanUsers: ownerUserId ? 1 : 0,
        totalMappedAgents: agentMappings.length,
        ownedAgentCount: agentMappings.filter((mapping) => mapping.mappingStatus === "owned").length,
      },
    },
  };
}
