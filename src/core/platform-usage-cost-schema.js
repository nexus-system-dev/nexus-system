const CANONICAL_USAGE_TYPES = new Set([
  "model",
  "workspace",
  "storage",
  "build",
  "provider-operation",
]);

const CANONICAL_UNITS = new Set([
  "token",
  "workspace-minute",
  "gb-month",
  "build-minute",
  "operation",
]);

const USAGE_TYPE_TO_UNIT = {
  model: "token",
  workspace: "workspace-minute",
  storage: "gb-month",
  build: "build-minute",
  "provider-operation": "operation",
};

const CANONICAL_PRICING_MODELS = new Set([
  "per-unit",
  "tiered",
  "fixed",
]);

function normalizeObject(value) {
  return value && typeof value === "object" ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function normalizeUsageType(value) {
  const normalized = normalizeString(value)?.toLowerCase() ?? null;
  return CANONICAL_USAGE_TYPES.has(normalized) ? normalized : "unknown-usage-type";
}

function normalizeUnit(value, usageType) {
  const normalized = normalizeString(value)?.toLowerCase() ?? null;
  if (CANONICAL_UNITS.has(normalized)) {
    return normalized;
  }

  return USAGE_TYPE_TO_UNIT[usageType] ?? "unknown-cost-unit";
}

function normalizePricingModel(value) {
  const normalized = normalizeString(value)?.toLowerCase() ?? null;
  return CANONICAL_PRICING_MODELS.has(normalized) ? normalized : "per-unit";
}

function resolveRecordedAt(usageEvent) {
  const normalizedUsageEvent = normalizeObject(usageEvent);
  return normalizeString(normalizedUsageEvent.recordedAt)
    ?? normalizeString(normalizedUsageEvent.timestamp)
    ?? new Date().toISOString();
}

function calculateTotalCost(quantity, unitPrice) {
  if (quantity === null || unitPrice === null) {
    return null;
  }

  return quantity * unitPrice;
}

export function definePlatformUsageCostSchema({
  usageEvent = null,
  pricingMetadata = null,
} = {}) {
  const normalizedUsageEvent = normalizeObject(usageEvent);
  const normalizedPricingMetadata = normalizeObject(pricingMetadata);
  const usageType = normalizeUsageType(normalizedUsageEvent.usageType);
  const quantity = normalizeFiniteNumber(normalizedUsageEvent.quantity);
  const unitPrice = normalizeFiniteNumber(normalizedPricingMetadata.unitPrice);
  const unit = normalizeUnit(normalizedUsageEvent.unit, usageType);
  const pricingModel = normalizePricingModel(normalizedPricingMetadata.pricingModel);
  const currency = normalizeString(normalizedPricingMetadata.currency)?.toLowerCase() ?? "usd";
  const scopeType = normalizeString(normalizedUsageEvent.scopeType)?.toLowerCase() ?? "project";
  const scopeId = normalizeString(normalizedUsageEvent.scopeId) ?? null;
  const sourceType = normalizeString(normalizedUsageEvent.sourceType)?.toLowerCase() ?? null;
  const recordedAt = resolveRecordedAt(normalizedUsageEvent);
  const totalCost = calculateTotalCost(quantity, unitPrice);

  return {
    platformCostMetric: {
      platformCostMetricId: `platform-cost-metric:${usageType}:${scopeType}:${scopeId ?? "global"}:${recordedAt}`,
      usageType,
      scopeType,
      scopeId,
      quantity,
      unit,
      unitPrice,
      totalCost,
      currency,
      pricingModel,
      sourceType,
      recordedAt,
      summary:
        totalCost === null
          ? `Platform cost metric for ${usageType} could not compute total cost because quantity or unit price is missing.`
          : `Platform cost metric for ${usageType} resolved to ${totalCost} ${currency}.`,
    },
  };
}
