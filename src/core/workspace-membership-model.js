function createWorkspaceId(userIdentity, workspaceMetadata) {
  if (typeof workspaceMetadata?.workspaceId === "string" && workspaceMetadata.workspaceId) {
    return workspaceMetadata.workspaceId;
  }

  return `workspace-${userIdentity?.userId ?? "anonymous"}`;
}

function normalizeRoles(userIdentity, workspaceMetadata) {
  if (Array.isArray(workspaceMetadata?.roles) && workspaceMetadata.roles.length > 0) {
    return workspaceMetadata.roles;
  }

  return [userIdentity?.userId ? "owner" : "viewer"];
}

export function defineWorkspaceAndMembershipModel({
  userIdentity = null,
  workspaceMetadata = null,
} = {}) {
  const workspaceId = createWorkspaceId(userIdentity, workspaceMetadata);
  const roles = normalizeRoles(userIdentity, workspaceMetadata);
  const ownerUserId =
    typeof workspaceMetadata?.ownerUserId === "string" && workspaceMetadata.ownerUserId
      ? workspaceMetadata.ownerUserId
      : userIdentity?.userId ?? null;
  const membershipStatus =
    typeof workspaceMetadata?.membershipStatus === "string" && workspaceMetadata.membershipStatus
      ? workspaceMetadata.membershipStatus
      : "active";

  return {
    workspaceModel: {
      workspaceId,
      name:
        typeof workspaceMetadata?.name === "string" && workspaceMetadata.name
          ? workspaceMetadata.name
          : userIdentity?.displayName
            ? `${userIdentity.displayName} Workspace`
            : "Nexus Workspace",
      status:
        typeof workspaceMetadata?.status === "string" && workspaceMetadata.status
          ? workspaceMetadata.status
          : "active",
      ownerUserId,
      visibility:
        typeof workspaceMetadata?.visibility === "string" && workspaceMetadata.visibility
          ? workspaceMetadata.visibility
          : "private",
      memberCount:
        Number.isInteger(workspaceMetadata?.memberCount) && workspaceMetadata.memberCount > 0
          ? workspaceMetadata.memberCount
          : 1,
      roles,
    },
    membershipRecord: {
      membershipId: `${workspaceId}:${userIdentity?.userId ?? "anonymous"}`,
      workspaceId,
      userId: userIdentity?.userId ?? null,
      role: roles[0] ?? "viewer",
      roles,
      status: membershipStatus,
      joinedAt:
        typeof workspaceMetadata?.joinedAt === "string" && workspaceMetadata.joinedAt
          ? workspaceMetadata.joinedAt
          : new Date().toISOString(),
      isOwner: ownerUserId != null && ownerUserId === userIdentity?.userId,
    },
  };
}
