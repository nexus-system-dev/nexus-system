function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function buildSummary({ hasBillingPlanSchema, status }) {
  if (!hasBillingPlanSchema) {
    return "Billing schema missing, defaulting to active";
  }

  if (status === "trial") {
    return "Workspace is currently in trial period";
  }

  return "Workspace is active with no trial";
}

export function createSubscriptionLifecycle({
  billingPlanSchema = null,
  workspaceModel = null,
} = {}) {
  const normalizedBillingPlanSchema = normalizeObject(billingPlanSchema);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const hasBillingPlanSchema = Object.keys(normalizedBillingPlanSchema).length > 0;
  const status = normalizedBillingPlanSchema?.trialRules?.default?.enabled === true ? "trial" : "active";
  const source = hasBillingPlanSchema ? "billing-plan-schema" : "fallback-default";

  return {
    subscriptionState: {
      subscriptionStateId: `subscription-state:${normalizeString(normalizedWorkspaceModel.workspaceId, "global")}:${status}`,
      workspaceId: normalizeString(normalizedWorkspaceModel.workspaceId, null),
      status,
      source,
      summary: buildSummary({
        hasBillingPlanSchema,
        status,
      }),
    },
  };
}
