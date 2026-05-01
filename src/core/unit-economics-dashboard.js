function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(profitMarginSummary) {
  const missingInputs = [];
  if (!profitMarginSummary || normalizeString(profitMarginSummary.status) !== "ready") missingInputs.push("profitMarginSummary");
  return missingInputs;
}

export function createUnitEconomicsDashboard({
  profitMarginSummary = null,
} = {}) {
  const margin = normalizeObject(profitMarginSummary);
  const missingInputs = buildMissingInputs(margin);

  if (missingInputs.length > 0) {
    return { unitEconomicsDashboard: { unitEconomicsDashboardId: `unit-econ:${slugify(margin?.profitMarginSummaryId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    unitEconomicsDashboard: {
      unitEconomicsDashboardId: `unit-econ:${slugify(margin.profitMarginSummaryId)}`,
      status: "ready",
      missingInputs: [],
      assumptionsStatus: "manual-inputs-needed",
    },
  };
}
