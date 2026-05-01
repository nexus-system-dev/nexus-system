function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerRevenueView, ownerCostView) {
  const missingInputs = [];
  if (!ownerRevenueView || normalizeString(ownerRevenueView.status) !== "ready") missingInputs.push("ownerRevenueView");
  if (!ownerCostView || normalizeString(ownerCostView.status) !== "ready") missingInputs.push("ownerCostView");
  return missingInputs;
}

export function createCashFlowProjectionEngine({
  ownerRevenueView = null,
  ownerCostView = null,
} = {}) {
  const revenue = normalizeObject(ownerRevenueView);
  const cost = normalizeObject(ownerCostView);
  const missingInputs = buildMissingInputs(revenue, cost);

  if (missingInputs.length > 0) {
    return { cashFlowProjection: { cashFlowProjectionId: `cash-flow:${slugify(revenue?.ownerRevenueViewId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    cashFlowProjection: {
      cashFlowProjectionId: `cash-flow:${slugify(revenue.ownerRevenueViewId)}`,
      status: "ready",
      missingInputs: [],
      runwayStatus: "projection-ready",
    },
  };
}
