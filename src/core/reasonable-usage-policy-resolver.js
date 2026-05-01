function normalizeWorkspaceMode(workspaceMode) {
  return workspaceMode && typeof workspaceMode === "object" ? workspaceMode : {};
}

function normalizeWorkspaceModeDefinitions(workspaceModeDefinitions) {
  return workspaceModeDefinitions && typeof workspaceModeDefinitions === "object"
    ? workspaceModeDefinitions
    : {};
}

function normalizeBillingPlanSchema(billingPlanSchema) {
  return billingPlanSchema && typeof billingPlanSchema === "object" ? billingPlanSchema : {};
}

function normalizeCostSummary(costSummary) {
  return costSummary && typeof costSummary === "object" ? costSummary : {};
}

function isValidWorkspaceModeType(value) {
  return value === "user-only" || value === "hybrid" || value === "autonomous";
}

function hasUsableDefinitionFields(definition) {
  return Boolean(
    definition
    && typeof definition === "object"
    && typeof definition.actor === "string"
    && typeof definition.aiUsageLevel === "string"
    && typeof definition.expectedCostProfile === "string"
    && typeof definition.enforcementLevel === "string",
  );
}

function isUsableThreshold(value) {
  return Number.isFinite(value) && value > 0;
}

function isUsableCurrency(costSummary) {
  return typeof costSummary.currency === "string"
    && costSummary.currency.length > 0
    && costSummary.currencyMismatch !== true;
}

function resolveThreshold(billingPlanSchema) {
  const spendThresholds = billingPlanSchema.limits?.spendThresholds ?? {};
  const perSession = spendThresholds.perSession;
  const perAction = spendThresholds.perAction;

  if (isUsableThreshold(perSession)) {
    return {
      type: "per-session",
      amount: perSession,
      usedFallback: false,
    };
  }

  if (isUsableThreshold(perAction)) {
    return {
      type: "per-action",
      amount: perAction,
      usedFallback: true,
    };
  }

  return {
    type: null,
    amount: null,
    usedFallback: false,
  };
}

function resolveEnforcement(workspaceModeType, workspaceModeDefinitions) {
  const definition = workspaceModeDefinitions[workspaceModeType] ?? null;

  return {
    enforcementLevel: definition?.enforcementLevel ?? (
      workspaceModeType === "autonomous"
        ? "strict"
        : workspaceModeType === "hybrid"
          ? "balanced"
          : "lenient"
    ),
    withinLimitAction: "allow",
    approachingLimitAction: "contact-support",
    overLimitAction: "upgrade-plan",
  };
}

function buildMissingPolicy({ workspaceModeType, explanation }) {
  const policyWorkspaceMode = typeof workspaceModeType === "string" ? workspaceModeType : null;

  return {
    reasonableUsagePolicy: {
      policyId: `reasonable-usage-policy::${policyWorkspaceMode ?? "unknown"}::missing-threshold`,
      workspaceMode: policyWorkspaceMode,
      threshold: {
        type: null,
        amount: null,
        currency: null,
        source: "billing-plan-schema",
      },
      enforcement: {
        enforcementLevel: null,
        withinLimitAction: "allow",
        approachingLimitAction: "contact-support",
        overLimitAction: "upgrade-plan",
      },
      summary: {
        summaryStatus: "missing-inputs",
        explanation,
      },
    },
  };
}

export function createReasonableUsagePolicyResolver({
  workspaceMode,
  workspaceModeDefinitions,
  billingPlanSchema,
  billableUsage,
  costSummary,
} = {}) {
  void billableUsage;

  const normalizedWorkspaceMode = normalizeWorkspaceMode(workspaceMode);
  const normalizedWorkspaceModeDefinitions = normalizeWorkspaceModeDefinitions(workspaceModeDefinitions);
  const normalizedBillingPlanSchema = normalizeBillingPlanSchema(billingPlanSchema);
  const normalizedCostSummary = normalizeCostSummary(costSummary);
  const workspaceModeType = normalizedWorkspaceMode.type;

  if (!isValidWorkspaceModeType(workspaceModeType)) {
    return buildMissingPolicy({
      workspaceModeType,
      explanation: "Workspace mode is missing or invalid.",
    });
  }

  const workspaceModeDefinition = normalizedWorkspaceModeDefinitions[workspaceModeType] ?? null;
  if (!hasUsableDefinitionFields(workspaceModeDefinition)) {
    return buildMissingPolicy({
      workspaceModeType,
      explanation: "Workspace mode definitions are missing or incomplete.",
    });
  }

  const threshold = resolveThreshold(normalizedBillingPlanSchema);
  if (!threshold.type) {
    return buildMissingPolicy({
      workspaceModeType,
      explanation: "Billing plan thresholds are missing or unusable.",
    });
  }

  const hasUsableCurrency = isUsableCurrency(normalizedCostSummary);
  const currency = hasUsableCurrency ? normalizedCostSummary.currency : null;
  const thresholdTypeForId = threshold.type ?? "missing-threshold";

  let summaryStatus = "complete";
  let explanation = "Reasonable usage policy resolved from workspace mode and billing plan.";

  if (
    threshold.usedFallback
    || !hasUsableCurrency
    || normalizedCostSummary.summary?.summaryStatus === "partial"
    || normalizedCostSummary.currencyMismatch === true
  ) {
    summaryStatus = "partial";
    explanation = threshold.usedFallback
      ? "Reasonable usage policy resolved with fallback per-action threshold."
      : "Reasonable usage policy resolved with incomplete monetary context.";
  }

  return {
    reasonableUsagePolicy: {
      policyId: `reasonable-usage-policy::${workspaceModeType}::${thresholdTypeForId}`,
      workspaceMode: workspaceModeType,
      threshold: {
        type: threshold.type,
        amount: threshold.amount,
        currency,
        source: "billing-plan-schema",
      },
      enforcement: resolveEnforcement(workspaceModeType, normalizedWorkspaceModeDefinitions),
      summary: {
        summaryStatus,
        explanation,
      },
    },
  };
}
