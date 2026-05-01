function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createIncidentTimelineTracker({
  ownerIncident = null,
  platformTrace = null,
} = {}) {
  const incident = normalizeObject(ownerIncident);
  const trace = normalizeObject(platformTrace);
  const ready = incident && normalizeString(incident.status) === "ready";

  return {
    incidentTimeline: {
      incidentTimelineId: `incident-timeline:${slugify(incident?.ownerIncidentId)}`,
      status: ready ? "ready" : "missing-inputs",
      missingInputs: ready ? [] : ["ownerIncident"],
      entries: [
        {
          phase: "detection",
          traceId: normalizeString(trace?.traceId),
          state: normalizeString(incident?.incidentState) ?? "monitoring",
        },
        {
          phase: "response",
          traceId: normalizeString(trace?.traceId),
          state: "in-progress",
        },
      ],
    },
  };
}
