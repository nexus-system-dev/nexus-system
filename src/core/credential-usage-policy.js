function normalizeActorType(actorType) {
  return typeof actorType === "string" && actorType.trim() ? actorType.trim() : "system";
}

function normalizeFlowType(flowType) {
  return typeof flowType === "string" && flowType.trim() ? flowType.trim() : "execution";
}

function normalizeProjectState(projectState) {
  return projectState && typeof projectState === "object" ? projectState : {};
}

export function createCredentialUsagePolicy({
  credentialReference,
  actorType,
  flowType,
  projectState,
} = {}) {
  const normalizedActorType = normalizeActorType(actorType);
  const normalizedFlowType = normalizeFlowType(flowType);
  const normalizedProjectState = normalizeProjectState(projectState);
  const approvalStatus = normalizedProjectState.approvalStatus ?? null;
  const policyDecision = normalizedProjectState.policyDecision ?? null;
  const hasCredential = typeof credentialReference === "string" && credentialReference.trim().length > 0;
  const sensitiveFlow = ["deploy", "build", "release", "execution"].includes(normalizedFlowType);

  if (!hasCredential) {
    return {
      credentialPolicyDecision: {
        credentialReference: null,
        actorType: normalizedActorType,
        flowType: normalizedFlowType,
        decision: "blocked",
        isAllowed: false,
        requiresApproval: false,
        isBlocked: true,
        reason: "Credential reference is missing",
      },
    };
  }

  if (approvalStatus?.status === "rejected" || policyDecision?.decision === "blocked") {
    return {
      credentialPolicyDecision: {
        credentialReference,
        actorType: normalizedActorType,
        flowType: normalizedFlowType,
        decision: "blocked",
        isAllowed: false,
        requiresApproval: false,
        isBlocked: true,
        reason: approvalStatus?.reason ?? policyDecision?.reason ?? "Credential usage is blocked by policy",
      },
    };
  }

  if (
    sensitiveFlow
    && normalizedActorType !== "user"
    && (approvalStatus?.status !== "approved" || policyDecision?.decision === "requires-approval")
  ) {
    return {
      credentialPolicyDecision: {
        credentialReference,
        actorType: normalizedActorType,
        flowType: normalizedFlowType,
        decision: "requires-approval",
        isAllowed: false,
        requiresApproval: true,
        isBlocked: true,
        reason: policyDecision?.reason ?? "Credential usage requires approval for this flow",
      },
    };
  }

  return {
    credentialPolicyDecision: {
      credentialReference,
      actorType: normalizedActorType,
      flowType: normalizedFlowType,
      decision: "allowed",
      isAllowed: true,
      requiresApproval: false,
      isBlocked: false,
      reason: `Credential usage is allowed for ${normalizedActorType} in ${normalizedFlowType}`,
    },
  };
}
