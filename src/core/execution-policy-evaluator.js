import { createActionPolicyRegistry } from "./action-policy-registry.js";

function normalizeActionType(actionType) {
  return typeof actionType === "string" && actionType.trim()
    ? actionType.trim()
    : "unspecified-action";
}

function normalizeActorType(actorType) {
  return typeof actorType === "string" && actorType.trim()
    ? actorType.trim()
    : "system";
}

function normalizePayload(actionPayload) {
  return actionPayload && typeof actionPayload === "object" ? actionPayload : {};
}

function normalizeProjectState(projectState) {
  return projectState && typeof projectState === "object" ? projectState : {};
}

export function createExecutionPolicyEvaluator({
  actionType,
  actorType,
  actionPayload,
  projectState,
} = {}) {
  const normalizedActionType = normalizeActionType(actionType);
  const normalizedActorType = normalizeActorType(actorType);
  const normalizedPayload = normalizePayload(actionPayload);
  const normalizedProjectState = normalizeProjectState(projectState);
  const { actionPolicy } = createActionPolicyRegistry({
    actionType: normalizedActionType,
    policySchema: normalizedProjectState.policySchema ?? null,
  });

  const gatingDecision = normalizedProjectState.gatingDecision ?? null;
  const unresolvedApprovalRequirement = actionPolicy.requiresApproval
    && gatingDecision?.decision !== "allowed";
  const approvalRequired = Boolean(
    unresolvedApprovalRequirement
    || gatingDecision?.requiresApproval
    || normalizedPayload.environment === "production"
    || normalizedPayload.hasMigration === true
    || normalizedPayload.hasFinancialImpact === true,
  );
  const explicitlyBlocked = actionPolicy.decision === "deny" || gatingDecision?.decision === "blocked";
  const decision = explicitlyBlocked
    ? "blocked"
    : approvalRequired
      ? "requires-approval"
      : "allowed";

  return {
    policyDecision: {
      actionType: normalizedActionType,
      actorType: normalizedActorType,
      policyId: actionPolicy.id,
      decision,
      isAllowed: decision === "allowed",
      requiresApproval: decision === "requires-approval",
      isBlocked: decision === "blocked",
      matchedPolicies: actionPolicy.matchedPolicies ?? [],
      reason: decision === "blocked"
        ? gatingDecision?.reason ?? "Execution policy blocked this action"
        : decision === "requires-approval"
          ? gatingDecision?.reason ?? `Action ${normalizedActionType} requires approval`
          : `Action ${normalizedActionType} is allowed for ${normalizedActorType}`,
    },
  };
}
