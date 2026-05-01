function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

export function createBaselineCollaborationEventAssembler({
  userIdentity = null,
  membershipRecord = null,
  accessDecision = null,
  sessionState = null,
  workspaceModel = null,
  approvalStatus = null,
  approvalRequestWithStatus = null,
  workspaceAction = null,
} = {}) {
  const normalizedUserIdentity = normalizeObject(userIdentity);
  const normalizedMembershipRecord = normalizeObject(membershipRecord);
  const normalizedAccessDecision = normalizeObject(accessDecision);
  const normalizedSessionState = normalizeObject(sessionState);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const normalizedApprovalStatus = normalizeObject(approvalStatus);
  const normalizedApprovalRequest = normalizeObject(approvalRequestWithStatus);
  const normalizedWorkspaceAction = normalizeObject(workspaceAction);

  return {
    baselineCollaborationEvent: {
      workspaceAction: {
        eventId: normalizedWorkspaceAction.eventId ?? null,
        actionType:
          normalizedWorkspaceAction.actionType
          ?? (normalizedApprovalStatus.status === "pending" ? "shared-approval" : "presence-signal"),
        message:
          normalizedWorkspaceAction.message
          ?? (normalizedApprovalStatus.status === "pending"
            ? "Approval is waiting for shared review"
            : "Workspace presence updated"),
        mentions: Array.isArray(normalizedWorkspaceAction.mentions) ? normalizedWorkspaceAction.mentions : [],
        reviewStatus: normalizedWorkspaceAction.reviewStatus ?? null,
        approvalStatus: normalizedApprovalStatus.status ?? null,
        workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
        projectId: normalizedWorkspaceAction.projectId ?? normalizedApprovalRequest.projectId ?? null,
        workspaceArea: normalizedWorkspaceAction.workspaceArea ?? "developer-workspace",
        visibility: normalizedWorkspaceAction.visibility ?? normalizedWorkspaceModel.visibility ?? "workspace",
        resourceId: normalizedWorkspaceAction.resourceId ?? normalizedApprovalRequest.approvalRequestId ?? null,
      },
      actorContext: {
        actorId: normalizedUserIdentity.userId ?? null,
        userId: normalizedUserIdentity.userId ?? null,
        displayName: normalizedUserIdentity.displayName ?? null,
        role: normalizedMembershipRecord.role ?? normalizedAccessDecision.effectiveRole ?? "viewer",
        presence: normalizedSessionState.status === "active" ? "active" : "idle",
        workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
        projectId: normalizedWorkspaceAction.projectId ?? normalizedApprovalRequest.projectId ?? null,
        workspaceArea: "developer-workspace",
        workspaceVisibility: normalizedWorkspaceModel.visibility ?? "workspace",
      },
    },
  };
}
