function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value)
    ? value.filter((item) => typeof item === "string" && item.trim().length > 0)
    : [];
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function resolveEntitlementSource({
  normalizedSchema,
  normalizedWorkspaceBillingState,
}) {
  const entitlements = normalizeObject(normalizedSchema.entitlements);
  const defaultPlanId = normalizeString(normalizedSchema.plans?.[0]?.planId);
  const currentPlanId = normalizeString(normalizedWorkspaceBillingState.currentPlanId);
  const runtimePlanId = currentPlanId ?? defaultPlanId;
  const selectedEntitlements = normalizeObject(entitlements[runtimePlanId]);
  const defaultEntitlements = normalizeObject(entitlements.default);

  if (Object.keys(selectedEntitlements).length > 0) {
    return {
      planId: runtimePlanId,
      entitlements: selectedEntitlements,
      source: currentPlanId ? "workspace-billing-state" : "billing-plan-default",
    };
  }

  return {
    planId: runtimePlanId,
    entitlements: defaultEntitlements,
    source: currentPlanId ? "workspace-billing-state-fallback" : "billing-plan-default",
  };
}

function buildSummary({ decision, features, hasUsableLimits, source, planId }) {
  if (source === "fallback-default") {
    return "Missing billing plan schema, fallback applied.";
  }

  if (decision === "blocked") {
    return "Billing entitlement schema is missing required entitlement structure.";
  }

  if (features.length === 0) {
    return `No features available under ${planId ?? "current"} billing plan.`;
  }

  if (!hasUsableLimits) {
    return `Billing limits missing or incomplete for ${planId ?? "current"} plan.`;
  }

  return `All entitlements available from ${planId ?? "current"} billing plan.`;
}

export function resolveEntitlementDecision({
  billingPlanSchema = null,
  workspaceModel = null,
  workspaceBillingState = null,
} = {}) {
  const normalizedSchema = normalizeObject(billingPlanSchema);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const normalizedWorkspaceBillingState = normalizeObject(workspaceBillingState);
  const selectedEntitlementSource = resolveEntitlementSource({
    normalizedSchema,
    normalizedWorkspaceBillingState,
  });
  const features = normalizeArray(selectedEntitlementSource.entitlements.features);
  const limits = normalizeObject(normalizedSchema.limits);
  const hasSchema = Object.keys(normalizedSchema).length > 0;
  const hasEntitlements = Object.keys(selectedEntitlementSource.entitlements).length > 0;
  const hasUsableLimits = Object.keys(limits).length > 0;

  let decision = "blocked";
  let source = "fallback-default";

  if (hasSchema) {
    source = selectedEntitlementSource.source;

    if (!hasEntitlements) {
      decision = "blocked";
    } else if (features.length === 0 || !hasUsableLimits) {
      decision = "restricted";
    } else {
      decision = "allowed";
    }
  }

  return {
    entitlementDecision: {
      entitlementDecisionId: `entitlement-decision:${normalizeString(normalizedSchema.billingPlanSchemaId, "missing-billing-plan")}:${normalizeString(normalizedWorkspaceModel.workspaceId, "global")}`,
      decision,
      features,
      limits,
      source,
      summary: buildSummary({
        decision,
        features,
        hasUsableLimits,
        source,
        planId: selectedEntitlementSource.planId,
      }),
    },
  };
}
