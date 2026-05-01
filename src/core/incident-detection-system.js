function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerOperationsSignals) {
  const missingInputs = [];
  if (!ownerOperationsSignals || normalizeString(ownerOperationsSignals.status) !== "ready") missingInputs.push("ownerOperationsSignals");
  return missingInputs;
}

export function createIncidentDetectionSystem({
  ownerOperationsSignals = null,
  platformTrace = null,
} = {}) {
  const signals = normalizeObject(ownerOperationsSignals);
  const trace = normalizeObject(platformTrace);
  const missingInputs = buildMissingInputs(signals);

  if (missingInputs.length > 0) {
    return { ownerIncident: { ownerIncidentId: `owner-incident:${slugify(signals?.ownerOperationsSignalsId)}`, status: "missing-inputs", missingInputs } };
  }

  return {
    ownerIncident: {
      ownerIncidentId: `owner-incident:${slugify(signals.ownerOperationsSignalsId)}`,
      status: "ready",
      missingInputs: [],
      incidentState: normalizeString(signals.healthStatus) === "active" ? "active" : "monitoring",
      traceId: normalizeString(trace?.traceId),
    },
  };
}
