function createInvitationId(workspaceId, email) {
  return `invite-${workspaceId ?? "workspace"}-${email ?? "unknown"}-${Date.now()}`;
}

function normalizeInvitationRequest(invitationRequest) {
  return invitationRequest && typeof invitationRequest === "object" ? invitationRequest : {};
}

function normalizeWorkspaceModel(workspaceModel) {
  return workspaceModel && typeof workspaceModel === "object" ? workspaceModel : {};
}

export function createRoleAssignmentAndInvitationFlow({
  workspaceModel = null,
  invitationRequest = null,
} = {}) {
  const normalizedWorkspaceModel = normalizeWorkspaceModel(workspaceModel);
  const normalizedInvitationRequest = normalizeInvitationRequest(invitationRequest);
  const invitedEmail =
    typeof normalizedInvitationRequest.email === "string" && normalizedInvitationRequest.email
      ? normalizedInvitationRequest.email
      : null;
  const role =
    typeof normalizedInvitationRequest.role === "string" && normalizedInvitationRequest.role
      ? normalizedInvitationRequest.role
      : "viewer";
  const invitedBy = normalizedInvitationRequest.invitedBy ?? normalizedWorkspaceModel.ownerUserId ?? null;
  const workspaceId = normalizedWorkspaceModel.workspaceId ?? null;
  const status = invitedEmail ? "pending" : "invalid";

  return {
    invitationRecord: {
      invitationId: createInvitationId(workspaceId, invitedEmail),
      workspaceId,
      email: invitedEmail,
      role,
      invitedBy,
      status,
      deliveryChannel: invitedEmail ? "email" : null,
      expiresAt: invitedEmail ? new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)).toISOString() : null,
    },
    roleAssignment: {
      workspaceId,
      userId: normalizedInvitationRequest.userId ?? null,
      email: invitedEmail,
      role,
      previousRole: normalizedInvitationRequest.previousRole ?? null,
      status: status === "pending" ? "assigned-pending-acceptance" : "not-assigned",
      effectiveAt: invitedEmail ? new Date().toISOString() : null,
    },
  };
}
