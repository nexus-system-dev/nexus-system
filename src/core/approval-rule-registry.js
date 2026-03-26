function normalizeActionType(actionType) {
  return typeof actionType === "string" && actionType.trim() ? actionType.trim() : "unspecified-action";
}

const APPROVAL_RULES = [
  {
    id: "deployment-approval",
    match: ({ actionType, actionPayload }) =>
      actionType.includes("deploy") || actionPayload.environment === "production",
    riskLevel: "high",
    approvalClass: "deployment",
  },
  {
    id: "migration-approval",
    match: ({ actionType, actionPayload }) =>
      actionType.includes("migration") || actionPayload.hasMigration === true,
    riskLevel: "high",
    approvalClass: "migration",
  },
  {
    id: "credential-approval",
    match: ({ actionType }) => actionType.includes("credential") || actionType.includes("secret"),
    riskLevel: "high",
    approvalClass: "credential",
  },
  {
    id: "financial-approval",
    match: ({ actionType, actionPayload }) =>
      actionType.includes("cost") || actionPayload.hasFinancialImpact === true,
    riskLevel: "high",
    approvalClass: "financial",
  },
  {
    id: "execution-approval",
    match: () => true,
    riskLevel: "medium",
    approvalClass: "execution",
  },
];

export function createApprovalRuleRegistry({
  actionType,
  actionPayload = {},
} = {}) {
  const normalizedActionType = normalizeActionType(actionType).toLowerCase();
  const payload = actionPayload && typeof actionPayload === "object" ? actionPayload : {};
  const approvalRule = APPROVAL_RULES.find((rule) =>
    rule.match({
      actionType: normalizedActionType,
      actionPayload: payload,
    }));

  return {
    approvalRule: approvalRule
      ? {
          id: approvalRule.id,
          actionType: normalizedActionType,
          riskLevel: approvalRule.riskLevel,
          approvalClass: approvalRule.approvalClass,
        }
      : {
          id: "execution-approval",
          actionType: normalizedActionType,
          riskLevel: "medium",
          approvalClass: "execution",
        },
  };
}
