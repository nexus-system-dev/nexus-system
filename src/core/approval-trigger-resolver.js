import { createApprovalRuleRegistry } from "./approval-rule-registry.js";

function normalizeActionType(actionType) {
  return typeof actionType === "string" && actionType.trim() ? actionType.trim() : "unspecified-action";
}

function normalizePolicyContext(policyContext) {
  return policyContext && typeof policyContext === "object" ? policyContext : {};
}

export function createApprovalTriggerResolver({
  actionType,
  actionPayload = {},
  policyContext = {},
} = {}) {
  const normalizedActionType = normalizeActionType(actionType);
  const normalizedPolicyContext = normalizePolicyContext(policyContext);
  const decisionIntelligence = normalizedPolicyContext.decisionIntelligence ?? null;
  const { approvalRule } = createApprovalRuleRegistry({
    actionType: normalizedActionType,
    actionPayload,
  });
  const approvalType = approvalRule.id;
  const decisionReason = decisionIntelligence?.approvalRequired?.[0]?.reason ?? null;
  const payloadRequiresApproval =
    actionPayload?.hasMigration === true
    || actionPayload?.hasFinancialImpact === true
    || actionPayload?.environment === "production";
  const requiresApproval = Boolean(
    normalizedPolicyContext.forceApproval
      || payloadRequiresApproval
      || decisionIntelligence?.summary?.requiresApproval,
  );

  return {
    requiresApproval,
    approvalReason: requiresApproval
      ? decisionReason ?? `Action ${normalizedActionType} requires approval`
      : null,
    approvalType,
  };
}
