function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeRoles(workspaceModel) {
  return Array.isArray(workspaceModel.roles) && workspaceModel.roles.length > 0
    ? workspaceModel.roles
    : ["viewer"];
}

function resolveApprovalParticipants(workspaceModel, approvalRequest) {
  const roles = new Set(normalizeRoles(workspaceModel));
  roles.add("owner");

  const canUseOperators = ["deploy", "release", "publish"].includes(approvalRequest.actionType);
  if (canUseOperators) {
    roles.add("operator");
  }

  if (approvalRequest.riskContext?.riskLevel === "high") {
    roles.add("reviewer");
  }

  return Array.from(roles).map((role) => ({
    participantRole: role,
    visibility: role === "viewer" ? "summary-only" : "decision-visible",
    decisionScope:
      role === "owner"
        ? "final-decision"
        : role === "operator"
          ? "execution-readiness"
          : role === "reviewer"
            ? "risk-review"
            : "view-only",
    required: ["owner", "reviewer"].includes(role),
  }));
}

function resolveCoordinationRules(approvalRequest, participants) {
  const riskLevel = approvalRequest.riskContext?.riskLevel ?? "medium";
  const requiredParticipants = participants.filter((participant) => participant.required);

  return {
    quorum: riskLevel === "high" ? Math.max(requiredParticipants.length, 2) : 1,
    requiresOwnerDecision: participants.some((participant) => participant.participantRole === "owner"),
    requiresReviewerDecision: riskLevel === "high",
    allowsParallelReview: participants.length > 1,
  };
}

function resolveDecisionState(approvalRequest, coordinationRules) {
  const status = approvalRequest.status ?? "pending";

  return {
    status,
    isResolved: ["approved", "rejected", "expired"].includes(status),
    isWaitingForReview: ["pending", "requested", "missing"].includes(status),
    requiresMoreDecisions:
      ["pending", "requested", "missing"].includes(status) && coordinationRules.quorum > 1,
  };
}

export function createSharedApprovalFlowModel({
  approvalRequest = null,
  workspaceModel = null,
} = {}) {
  const normalizedApprovalRequest = normalizeObject(approvalRequest);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const participants = resolveApprovalParticipants(normalizedWorkspaceModel, normalizedApprovalRequest);
  const coordinationRules = resolveCoordinationRules(normalizedApprovalRequest, participants);
  const decisionState = resolveDecisionState(normalizedApprovalRequest, coordinationRules);

  return {
    sharedApprovalState: {
      sharedApprovalStateId: `shared-approval:${normalizedApprovalRequest.approvalRequestId ?? "unknown-request"}`,
      approvalRequestId: normalizedApprovalRequest.approvalRequestId ?? null,
      workspaceId: normalizedWorkspaceModel.workspaceId ?? null,
      visibility:
        normalizedWorkspaceModel.visibility === "public"
          ? "workspace-visible"
          : "restricted-workspace",
      participants,
      coordinationRules,
      decisionState,
      summary: {
        totalParticipants: participants.length,
        requiredParticipantCount: participants.filter((participant) => participant.required).length,
        requiresCoordinatedDecision: coordinationRules.quorum > 1,
        currentStatus: decisionState.status,
      },
    },
  };
}
