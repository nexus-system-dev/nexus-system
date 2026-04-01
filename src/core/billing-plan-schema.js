function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value, fallback = null) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeFiniteNumber(value, fallback = null) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeUsageType(platformCostMetric = null) {
  const normalizedPlatformCostMetric = normalizeObject(platformCostMetric);
  return normalizeString(normalizedPlatformCostMetric.usageType, "unknown");
}

function normalizeUnit(platformCostMetric = null) {
  const normalizedPlatformCostMetric = normalizeObject(platformCostMetric);
  return normalizeString(normalizedPlatformCostMetric.unit, null);
}

function normalizePricingModel(platformCostMetric = null) {
  const normalizedPlatformCostMetric = normalizeObject(platformCostMetric);
  return normalizeString(normalizedPlatformCostMetric.pricingModel, null);
}

function buildPlans(platformCostMetric = null) {
  return [
    {
      planId: "default",
      planName: "Default Plan",
      pricingModel: normalizePricingModel(platformCostMetric),
      usageBased: true,
    },
  ];
}

function buildUsageDimensions(platformCostMetric = null) {
  return [
    {
      usageType: normalizeUsageType(platformCostMetric),
      unit: normalizeUnit(platformCostMetric),
    },
  ];
}

function buildLimits(agentGovernancePolicy = null) {
  const spendThresholds = normalizeObject(normalizeObject(agentGovernancePolicy).spendThresholds);

  return {
    spendThresholds: {
      perAction: normalizeFiniteNumber(spendThresholds.perAction),
      perSession: normalizeFiniteNumber(spendThresholds.perSession),
      perDay: normalizeFiniteNumber(spendThresholds.perDay),
    },
  };
}

export function defineBillingPlanSchema({
  platformCostMetric = null,
  agentGovernancePolicy = null,
  reliabilitySlaModel = null,
} = {}) {
  const normalizedReliabilitySlaModel = normalizeObject(reliabilitySlaModel);
  const serviceTier = normalizeString(normalizedReliabilitySlaModel.serviceTier, "unknown-tier");
  const usageDimensions = buildUsageDimensions(platformCostMetric);

  return {
    billingPlanSchema: {
      billingPlanSchemaId: `billing-plan-schema:${usageDimensions[0].usageType}:${serviceTier}`,
      plans: buildPlans(platformCostMetric),
      usageDimensions,
      limits: buildLimits(agentGovernancePolicy),
      entitlements: {
        default: {
          features: [],
          limits: {},
        },
      },
      trialRules: {
        default: {
          enabled: false,
          durationDays: null,
        },
      },
    },
  };
}
