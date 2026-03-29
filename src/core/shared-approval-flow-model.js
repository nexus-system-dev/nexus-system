function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeRoles(workspaceModel) {
  return Array.isArray(workspaceModel.roles) && workspaceModel.roles.length > 0
    ? workspaceModel.roles
    : ["viewer"];
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
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

function resolveRoleDecision(entry = {}) {
  const eventType = entry.eventType ?? "approval.event";
  if (eventType === "approval.approved") {
    return "approved";
  }

  if (eventType === "approval.rejected") {
    return "rejected";
  }

  if (eventType === "approval.revoked") {
    return "revoked";
  }

  return "pending";
}

function resolveParticipantDecisions(participants, approvalRecords) {
  const latestRecord = normalizeArray(approvalRecords)[0] ?? {};
  const auditTrail = normalizeArray(latestRecord.auditTrail);

  return participants.map((participant) => {
    const matchingEntry = auditTrail.findLast?.((entry) => entry.actorRole === participant.participantRole)
      ?? [...auditTrail].reverse().find((entry) => entry.actorRole === participant.participantRole)
      ?? null;

    return {
      participantRole: participant.participantRole,
      visibility: participant.visibility,
      decisionScope: participant.decisionScope,
      required: participant.required,
      decision: matchingEntry ? resolveRoleDecision(matchingEntry) : "pending",
      actorId: matchingEntry?.actorId ?? null,
      actorName: matchingEntry?.actorName ?? null,
      reason: matchingEntry?.reason ?? null,
    };
  });
}

function resolveVisibilityRules(participants) {
  return participants.map((participant) => ({
    participantRole: participant.participantRole,
    visibility: participant.visibility,
    seesFullDecisionContext: participant.visibility === "decision-visible",
    canComment: participant.participantRole !== "viewer",
    canFinalize: participant.decisionScope === "final-decision",
  }));
}

function resolveCoordinationStatus(participantDecisions, decisionState, coordinationRules) {
  const pendingRequiredRoles = participantDecisions
    .filter((participant) => participant.required && !["approved", "rejected", "revoked"].includes(participant.decision))
    .map((participant) => participant.participantRole);

  return {
    pendingRequiredRoles,
    resolvedRoleCount: participantDecisions.filter((participant) => ["approved", "rejected", "revoked"].includes(participant.decision)).length,
    waitingForOwner: pendingRequiredRoles.includes("owner"),
    waitingForReviewer: pendingRequiredRoles.includes("reviewer"),
    isReadyForFinalization:
      !decisionState.isResolved
      && pendingRequiredRoles.length === 0
      && coordinationRules.requiresOwnerDecision,
  };
}

export function createSharedApprovalFlowModel({
  approvalRequest = null,
  workspaceModel = null,
  approvalRecords = [],
} = {}) {
  const normalizedApprovalRequest = normalizeObject(approvalRequest);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const participants = resolveApprovalParticipants(normalizedWorkspaceModel, normalizedApprovalRequest);
  const coordinationRules = resolveCoordinationRules(normalizedApprovalRequest, participants);
  const decisionState = resolveDecisionState(normalizedApprovalRequest, coordinationRules);
  const participantDecisions = resolveParticipantDecisions(participants, approvalRecords);
  const visibilityRules = resolveVisibilityRules(participants);
  const coordinationStatus = resolveCoordinationStatus(participantDecisions, decisionState, coordinationRules);

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
      participantDecisions,
      visibilityRules,
      coordinationRules,
      decisionState,
      coordinationStatus,
      summary: {
        totalParticipants: participants.length,
        requiredParticipantCount: participants.filter((participant) => participant.required).length,
        requiresCoordinatedDecision: coordinationRules.quorum > 1,
        currentStatus: decisionState.status,
        pendingRequiredRoleCount: coordinationStatus.pendingRequiredRoles.length,
      },
    },
  };
}
