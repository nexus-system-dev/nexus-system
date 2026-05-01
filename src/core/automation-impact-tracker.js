function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(taskThroughputSummary, productivitySummary, ownerRoutinePlan) {
  const missingInputs = [];
  if (!taskThroughputSummary || normalizeString(taskThroughputSummary.status) !== "ready") missingInputs.push("taskThroughputSummary");
  if (!productivitySummary || normalizeString(productivitySummary.status) !== "ready") missingInputs.push("productivitySummary");
  if (!ownerRoutinePlan || normalizeString(ownerRoutinePlan.status) !== "ready") missingInputs.push("ownerRoutinePlan");
  return missingInputs;
}

export function createAutomationImpactTracker({
  taskThroughputSummary = null,
  productivitySummary = null,
  ownerRoutinePlan = null,
} = {}) {
  const throughput = normalizeObject(taskThroughputSummary);
  const productivity = normalizeObject(productivitySummary);
  const routine = normalizeObject(ownerRoutinePlan);

  return {
    automationImpactSummary: {
      automationImpactSummaryId: `automation-impact:${slugify(throughput?.taskThroughputSummaryId)}`,
      status: "ready",
      missingInputs: buildMissingInputs(throughput, productivity, routine),
      throughputStatus: normalizeString(throughput?.status) ?? "missing",
      productivityStatus: normalizeString(productivity?.status) ?? "missing",
      routineStatus: normalizeString(routine?.status) ?? "missing",
    },
  };
}
