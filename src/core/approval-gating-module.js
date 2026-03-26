export function createApprovalGatingModule({
  approvalRequest,
  approvalStatus,
} = {}) {
  const requestId = approvalRequest?.approvalRequestId ?? null;
  const status = approvalStatus?.status ?? "missing";

  if (status === "approved") {
    return {
      gatingDecision: {
        decision: "allowed",
        isBlocked: false,
        requiresApproval: false,
        approvalRequestId: requestId,
        reason: approvalStatus?.reason ?? null,
      },
    };
  }

  if (status === "rejected") {
    return {
      gatingDecision: {
        decision: "blocked",
        isBlocked: true,
        requiresApproval: false,
        approvalRequestId: requestId,
        reason: approvalStatus?.reason ?? "Approval was rejected",
      },
    };
  }

  if (status === "expired" || status === "missing") {
    return {
      gatingDecision: {
        decision: "requires-approval",
        isBlocked: true,
        requiresApproval: true,
        approvalRequestId: requestId,
        reason: approvalStatus?.reason ?? "Valid approval is required before execution",
      },
    };
  }

  return {
    gatingDecision: {
      decision: "blocked",
      isBlocked: true,
      requiresApproval: true,
      approvalRequestId: requestId,
      reason: "Approval status is unresolved",
    },
  };
}
