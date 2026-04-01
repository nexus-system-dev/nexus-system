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

function buildSummary({ decision, features, hasUsableLimits, source }) {
  if (source === "fallback-default") {
    return "Missing billing plan schema, fallback applied.";
  }

  if (decision === "blocked") {
    return "Billing entitlement schema is missing required entitlement structure.";
  }

  if (features.length === 0) {
    return "No features available under current billing plan.";
  }

  if (!hasUsableLimits) {
    return "Billing limits missing or incomplete.";
  }

  return "All entitlements available from billing plan.";
}

export function resolveEntitlementDecision({
  billingPlanSchema = null,
  workspaceModel = null,
} = {}) {
  const normalizedSchema = normalizeObject(billingPlanSchema);
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);
  const entitlements = normalizeObject(normalizedSchema.entitlements);
  const defaultEntitlements = normalizeObject(entitlements.default);
  const features = normalizeArray(defaultEntitlements.features);
  const limits = normalizeObject(normalizedSchema.limits);
  const hasSchema = Object.keys(normalizedSchema).length > 0;
  const hasEntitlements = Object.keys(entitlements).length > 0 && Object.keys(defaultEntitlements).length > 0;
  const hasUsableLimits = Object.keys(limits).length > 0;

  let decision = "blocked";
  let source = "fallback-default";

  if (hasSchema) {
    source = "billing-plan-schema";

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
      }),
    },
  };
}
