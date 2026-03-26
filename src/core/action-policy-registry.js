function normalizeActionType(actionType) {
  return typeof actionType === "string" && actionType.trim()
    ? actionType.trim().toLowerCase()
    : "unspecified-action";
}

function normalizePolicySchema(policySchema) {
  return policySchema && typeof policySchema === "object"
    ? policySchema
    : {
        execution: { policies: [] },
        approvals: { policies: [] },
        credentials: { policies: [] },
        deploy: { policies: [] },
      };
}

function matchesPolicy(policy, actionType) {
  const allowedActions = Array.isArray(policy?.allowedActions) ? policy.allowedActions.map((value) => String(value).toLowerCase()) : [];
  const approvalTypes = Array.isArray(policy?.approvalTypes) ? policy.approvalTypes.map((value) => String(value).toLowerCase()) : [];
  const protectedFlows = Array.isArray(policy?.protectedFlows) ? policy.protectedFlows.map((value) => String(value).toLowerCase()) : [];
  const guardedTargets = Array.isArray(policy?.guardedTargets) ? policy.guardedTargets.map((value) => String(value).toLowerCase()) : [];

  return (
    allowedActions.some((value) => actionType.includes(value))
    || approvalTypes.some((value) => actionType.includes(value) || value.includes(actionType))
    || protectedFlows.some((value) => actionType.includes(value))
    || guardedTargets.some((value) => actionType.includes(value))
  );
}

export function createActionPolicyRegistry({
  actionType,
  policySchema = null,
} = {}) {
  const normalizedActionType = normalizeActionType(actionType);
  const normalizedPolicySchema = normalizePolicySchema(policySchema);
  const allPolicies = [
    ...(normalizedPolicySchema.execution?.policies ?? []),
    ...(normalizedPolicySchema.approvals?.policies ?? []),
    ...(normalizedPolicySchema.credentials?.policies ?? []),
    ...(normalizedPolicySchema.deploy?.policies ?? []),
  ];
  const matchedPolicies = allPolicies.filter((policy) => matchesPolicy(policy, normalizedActionType));
  const fallbackPolicy = matchedPolicies[0] ?? {
    id: "default-execution-policy",
    kind: "execution",
    allowedActions: [normalizedActionType],
    decision: "allow",
  };

  return {
    actionPolicy: {
      id: fallbackPolicy.id ?? "default-execution-policy",
      actionType: normalizedActionType,
      kind: fallbackPolicy.kind ?? "execution",
      matchedPolicies,
      decision: fallbackPolicy.decision ?? "allow",
      requiresApproval: Boolean(fallbackPolicy.requiresApproval),
    },
  };
}
