function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createCostTrackingSystem({
  costSummary = null,
  budgetDecision = null,
} = {}) {
  const cost = normalizeObject(costSummary);
  const budget = normalizeObject(budgetDecision);

  return {
    ownerCostView: {
      ownerCostViewId: `owner-cost:${slugify(cost?.costSummaryId)}`,
      status: "ready",
      missingInputs: [],
      costStatus: normalizeString(cost?.status) ?? "missing",
      budgetStatus: normalizeString(budget?.status) ?? "not-required",
    },
  };
}
