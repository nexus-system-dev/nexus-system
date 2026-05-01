const MAPPED_DIMENSION_ORDER = Object.freeze([
  "ai",
  "workspace",
  "build",
  "providerOperation",
  "unknown",
]);

const SOURCE_DIMENSION_ORDER = Object.freeze([
  "model",
  "workspace",
  "build",
  "providerOperation",
  "storage",
]);

const SOURCE_DIMENSION_RULES = Object.freeze({
  model: Object.freeze({
    dimension: "ai",
    unit: "token",
  }),
  workspace: Object.freeze({
    dimension: "workspace",
    unit: "workspace-minute",
  }),
  build: Object.freeze({
    dimension: "build",
    unit: "build-minute",
  }),
  providerOperation: Object.freeze({
    dimension: "providerOperation",
    unit: "operation",
  }),
  storage: null,
});

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeQuantity(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function isBreakdownUsable(breakdown) {
  const normalizedBreakdown = normalizeObject(breakdown);
  if (!normalizedBreakdown) {
    return false;
  }

  return Object.values(normalizedBreakdown).some((entry) => normalizeObject(entry));
}

function buildEmptyBillableUsage() {
  return {
    billableUsageId: "billable-usage::missing-inputs::0::0",
    items: [],
    summary: {
      summaryStatus: "missing-inputs",
      mappedItems: 0,
      unknownItems: 0,
    },
  };
}

function toUnknownItem(sourceDimension, quantity, unit) {
  return {
    dimension: "unknown",
    unit: unit ?? "unknown-unit",
    quantity,
    sourceDimension,
  };
}

function collectSourceDimensions(breakdown) {
  const normalizedBreakdown = normalizeObject(breakdown);
  const seen = new Set();
  const orderedDimensions = [];

  for (const sourceDimension of SOURCE_DIMENSION_ORDER) {
    if (sourceDimension in normalizedBreakdown) {
      orderedDimensions.push(sourceDimension);
      seen.add(sourceDimension);
    }
  }

  for (const sourceDimension of Object.keys(normalizedBreakdown)) {
    if (!seen.has(sourceDimension)) {
      orderedDimensions.push(sourceDimension);
    }
  }

  return orderedDimensions;
}

export function createUsageToBillingMapper({
  costSummary = null,
  billingPlanSchema = null,
} = {}) {
  void billingPlanSchema;

  const normalizedCostSummary = normalizeObject(costSummary);
  const breakdown = normalizeObject(normalizedCostSummary?.breakdown);
  if (!normalizedCostSummary || !isBreakdownUsable(breakdown)) {
    return {
      billableUsage: buildEmptyBillableUsage(),
    };
  }

  const mappedItems = [];
  const unknownItems = [];

  for (const sourceDimension of collectSourceDimensions(breakdown)) {
    const entry = normalizeObject(breakdown[sourceDimension]);
    if (!entry) {
      continue;
    }

    const quantity = normalizeQuantity(entry.quantity);
    if (quantity === null) {
      continue;
    }

    const unit = normalizeString(entry.unit);
    const sourceRule = Object.prototype.hasOwnProperty.call(SOURCE_DIMENSION_RULES, sourceDimension)
      ? SOURCE_DIMENSION_RULES[sourceDimension]
      : undefined;

    if (!sourceRule) {
      unknownItems.push(toUnknownItem(sourceDimension, quantity, unit));
      continue;
    }

    if (unit === sourceRule.unit) {
      mappedItems.push({
        dimension: sourceRule.dimension,
        unit: sourceRule.unit,
        quantity,
        sourceDimension,
      });
      continue;
    }

    unknownItems.push(toUnknownItem(sourceDimension, quantity, unit));
  }

  const orderedItems = [
    ...MAPPED_DIMENSION_ORDER
      .filter((dimension) => dimension !== "unknown")
      .flatMap((dimension) => mappedItems.filter((item) => item.dimension === dimension)),
    ...unknownItems,
  ];

  const summaryStatus = orderedItems.length === 0 ? "missing-inputs" : "complete";
  const summary = {
    summaryStatus,
    mappedItems: mappedItems.length,
    unknownItems: unknownItems.length,
  };

  return {
    billableUsage: {
      billableUsageId: `billable-usage::${summary.summaryStatus}::${summary.mappedItems}::${summary.unknownItems}`,
      items: orderedItems,
      summary,
    },
  };
}
