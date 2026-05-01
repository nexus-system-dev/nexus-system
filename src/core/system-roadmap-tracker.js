function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(taskThroughputSummary) {
  const missingInputs = [];
  if (!taskThroughputSummary || normalizeString(taskThroughputSummary.status) !== "ready") missingInputs.push("taskThroughputSummary");
  return missingInputs;
}

export function createSystemRoadmapTracker({
  roadmap = null,
  taskThroughputSummary = null,
} = {}) {
  const throughput = normalizeObject(taskThroughputSummary);

  return {
    roadmapTracking: {
      roadmapTrackingId: `roadmap-tracking:${slugify(throughput?.taskThroughputSummaryId)}`,
      status: "ready",
      missingInputs: buildMissingInputs(throughput),
      roadmapItems: Array.isArray(roadmap) ? roadmap.length : 0,
      throughputStatus: normalizeString(throughput?.status) ?? "missing",
    },
  };
}
