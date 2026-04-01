function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function hasUsablePricingMetadata(pricingMetadata = null) {
  const normalizedPricingMetadata = normalizeObject(pricingMetadata);

  return (
    normalizeFiniteNumber(normalizedPricingMetadata.unitPrice) !== null
    || normalizeString(normalizedPricingMetadata.currency) !== null
    || normalizeString(normalizedPricingMetadata.pricingModel) !== null
    || normalizeString(normalizedPricingMetadata.tier) !== null
  );
}

function hasPartialWorkspaceSignals(workspaceModel = null) {
  const normalizedWorkspaceModel = normalizeObject(workspaceModel);

  return (
    normalizeString(normalizedWorkspaceModel.workspaceId) !== null
    || normalizeString(normalizedWorkspaceModel.visibility) !== null
    || normalizeString(normalizedWorkspaceModel.serviceTier) !== null
  );
}

export function createBudgetConstraintEngine({
  workspaceModel = null,
  pricingMetadata = null,
  overrunStatus = "requires-escalation",
} = {}) {
  const pricingUsable = hasUsablePricingMetadata(pricingMetadata);
  const workspaceSignalsPresent = hasPartialWorkspaceSignals(workspaceModel);
  const constraintSource = pricingUsable ? "pricing+policy" : "policy-only";
  const fallbackApplied = pricingUsable === false;

  return {
    constraintSource,
    fallbackApplied,
    workspaceSignalsPresent,
    classifyThreshold(status) {
      return {
        hardLimitTriggered: status === "blocked" && overrunStatus === "blocked",
        softLimitTriggered: status === "requires-escalation" && overrunStatus === "requires-escalation",
      };
    },
  };
}
