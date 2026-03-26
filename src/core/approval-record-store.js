function normalizeApprovalDecision(approvalDecision, approvalRequest) {
  if (typeof approvalDecision === "string" && approvalDecision.trim()) {
    const normalizedDecision = approvalDecision.trim().toLowerCase();
    return {
      decision: normalizedDecision,
      approved: normalizedDecision === "approved",
      reason: null,
      expiresInHours: normalizedDecision === "approved" ? 24 : null,
      actorId: approvalRequest?.actorType ?? "system",
    };
  }

  const payload = approvalDecision && typeof approvalDecision === "object" ? approvalDecision : {};
  const decision = typeof payload.decision === "string" && payload.decision.trim()
    ? payload.decision.trim().toLowerCase()
    : payload.revoked === true
      ? "revoked"
      : payload.approved === false
      ? "rejected"
      : "approved";

  return {
    decision,
    approved: payload.approved ?? decision === "approved",
    reason: typeof payload.reason === "string" && payload.reason.trim() ? payload.reason.trim() : null,
    expiresInHours: Number.isFinite(payload.expiresInHours) ? payload.expiresInHours : decision === "approved" ? 24 : null,
    actorId: typeof payload.actorId === "string" && payload.actorId.trim()
      ? payload.actorId.trim()
      : approvalRequest?.actorType ?? "system",
  };
}

function buildAuditTrail(approvalRequest, normalizedDecision) {
  return [
    {
      eventType: "approval.requested",
      status: approvalRequest?.status ?? "pending",
      actorId: approvalRequest?.actorType ?? "system",
      reason: approvalRequest?.riskContext?.reason ?? null,
    },
    {
      eventType: normalizedDecision.decision === "revoked"
        ? "approval.revoked"
        : normalizedDecision.approved
          ? "approval.approved"
          : "approval.rejected",
      status: normalizedDecision.decision === "revoked"
        ? "revoked"
        : normalizedDecision.approved
          ? "approved"
          : "rejected",
      actorId: normalizedDecision.actorId,
      reason: normalizedDecision.reason,
    },
  ];
}

export function createApprovalRecordStore({
  approvalRequest,
  approvalDecision,
} = {}) {
  const request = approvalRequest && typeof approvalRequest === "object"
    ? approvalRequest
    : {
        approvalRequestId: "approval:unknown-project:unspecified-action:system",
        projectId: null,
        actionType: "unspecified-action",
        actorType: "system",
        actionPayload: {},
        riskContext: {
          riskLevel: "medium",
          reason: null,
          uncertainty: false,
        },
        requestedAt: null,
        status: "pending",
      };
  const normalizedDecision = normalizeApprovalDecision(approvalDecision, request);
  const approvalRecordId = request.approvalRequestId.replace(/^approval:/, "approval-record:");

  return {
    approvalRecord: {
      approvalRecordId,
      approvalRequestId: request.approvalRequestId,
      projectId: request.projectId ?? null,
      actionType: request.actionType,
      approvalType: request.actionPayload?.approvalType ?? null,
      actorType: request.actorType,
      decision: normalizedDecision.decision,
      status: normalizedDecision.decision === "revoked"
        ? "revoked"
        : normalizedDecision.approved
          ? "approved"
          : "rejected",
      reason: normalizedDecision.reason ?? request.riskContext?.reason ?? null,
      requestedAt: request.requestedAt ?? null,
      decidedAt: null,
      expiresAt: normalizedDecision.expiresInHours ? `in:${normalizedDecision.expiresInHours}h` : null,
      expiresInHours: normalizedDecision.expiresInHours,
      auditTrail: buildAuditTrail(request, normalizedDecision),
      riskContext: request.riskContext,
    },
  };
}
