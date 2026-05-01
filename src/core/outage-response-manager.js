function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerIncident, continuityPlan) {
  const missingInputs = [];
  if (!ownerIncident || normalizeString(ownerIncident.status) !== "ready") missingInputs.push("ownerIncident");
  if (!continuityPlan || normalizeString(continuityPlan.continuityPlanId) === null) missingInputs.push("continuityPlan");
  return missingInputs;
}

export function createOutageResponseManager({
  ownerIncident = null,
  continuityPlan = null,
} = {}) {
  const incident = normalizeObject(ownerIncident);
  const continuity = normalizeObject(continuityPlan);
  const missingInputs = buildMissingInputs(incident, continuity);

  return {
    outageResponsePlan: {
      outageResponsePlanId: `outage-response:${slugify(incident?.ownerIncidentId)}`,
      status: missingInputs.length > 0 ? "missing-inputs" : "ready",
      missingInputs,
      incidentState: normalizeString(incident?.incidentState) ?? "monitoring",
      runbookStatus: normalizeString(continuity?.summary?.status) ?? "available",
      ownerActions: ["assess-impact", "notify-stakeholders", "start-recovery"],
    },
  };
}
