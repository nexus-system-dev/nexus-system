function normalizeActionType(actionType) {
  return typeof actionType === "string" && actionType.trim() ? actionType.trim() : "unspecified-action";
}

function normalizeActorType(actorType) {
  return typeof actorType === "string" && actorType.trim() ? actorType.trim() : "system";
}

function normalizePayload(actionPayload) {
  return actionPayload && typeof actionPayload === "object" ? actionPayload : {};
}

function normalizeRiskContext(riskContext, decisionIntelligence) {
  const payload = riskContext && typeof riskContext === "object" ? riskContext : {};

  return {
    riskLevel: payload.riskLevel ?? (decisionIntelligence?.summary?.requiresApproval ? "high" : "medium"),
    reason: payload.reason ?? decisionIntelligence?.approvalRequired?.[0]?.reason ?? null,
    uncertainty: payload.uncertainty ?? decisionIntelligence?.summary?.hasUncertainty ?? false,
  };
}

export function defineApprovalRequestSchema({
  actionType,
  projectId,
  actorType,
  actionPayload,
  riskContext,
  decisionIntelligence = null,
} = {}) {
  const normalizedActionType = normalizeActionType(actionType);
  const normalizedActorType = normalizeActorType(actorType);
  const normalizedPayload = normalizePayload(actionPayload);
  const normalizedRiskContext = normalizeRiskContext(riskContext, decisionIntelligence);

  return {
    approvalRequest: {
      approvalRequestId: `approval:${projectId ?? "unknown-project"}:${normalizedActionType}:${normalizedActorType}`,
      projectId: projectId ?? null,
      actionType: normalizedActionType,
      actorType: normalizedActorType,
      actionPayload: normalizedPayload,
      riskContext: normalizedRiskContext,
      requestedAt: null,
      status: "pending",
    },
  };
}
