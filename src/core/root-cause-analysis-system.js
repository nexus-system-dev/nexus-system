function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

export function createRootCauseAnalysisSystem({
  incidentTimeline = null,
  causalImpactReport = null,
} = {}) {
  const timeline = normalizeObject(incidentTimeline);
  const impact = normalizeObject(causalImpactReport);
  const ready = timeline && normalizeString(timeline.status) === "ready";

  return {
    rootCauseSummary: {
      rootCauseSummaryId: `root-cause:${slugify(timeline?.incidentTimelineId)}`,
      status: ready ? "ready" : "missing-inputs",
      missingInputs: ready ? [] : ["incidentTimeline"],
      suspectedCause: normalizeString(impact?.primaryCause) ?? "runtime-signal-correlation",
      affectedServices: Array.isArray(impact?.affectedServices) ? impact.affectedServices : ["project-runtime"],
      correctiveActions: ["stabilize-runtime", "review-alert-thresholds", "schedule-follow-up"],
    },
  };
}
