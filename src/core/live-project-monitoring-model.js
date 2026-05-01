function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createLiveProjectMonitoringModel({
  platformTrace = null,
  releaseStateUpdate = null,
  ownerIncident = null,
} = {}) {
  const trace = normalizeObject(platformTrace);
  const releaseState = normalizeObject(releaseStateUpdate);
  const incident = normalizeObject(ownerIncident);

  return {
    liveProjectMonitoring: {
      liveProjectMonitoringId: `live-monitoring:${slugify(trace?.traceId ?? incident?.ownerIncidentId)}`,
      status: "ready",
      missingInputs: [],
      healthStatus: normalizeString(incident?.incidentState) === "active" ? "degraded" : "stable",
      releaseStatus: normalizeString(releaseState?.lifecycle?.phase) ?? "active",
      traceId: normalizeString(trace?.traceId),
      alerts: normalizeString(incident?.incidentState) === "active" ? ["owner-incident-active"] : [],
    },
  };
}
