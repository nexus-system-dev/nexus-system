function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createOperationsSignalAggregator({
  platformTrace = null,
  healthStatus = null,
  budgetDecision = null,
  incidentAlert = null,
} = {}) {
  const trace = normalizeObject(platformTrace);
  const budget = normalizeObject(budgetDecision);
  const alert = normalizeObject(incidentAlert);

  return {
    ownerOperationsSignals: {
      ownerOperationsSignalsId: `owner-ops-signals:${slugify(trace?.traceId ?? healthStatus)}`,
      status: "ready",
      missingInputs: [],
      healthStatus: normalizeString(healthStatus) ?? normalizeString(alert?.status) ?? "stable",
      budgetStatus: normalizeString(budget?.status) ?? "not-required",
      traceId: normalizeString(trace?.traceId),
    },
  };
}
