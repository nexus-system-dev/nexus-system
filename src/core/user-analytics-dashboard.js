function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(retentionSummary, taskThroughputSummary) {
  const missingInputs = [];
  if (!retentionSummary || normalizeString(retentionSummary.status) !== "ready") missingInputs.push("retentionSummary");
  if (!taskThroughputSummary || normalizeString(taskThroughputSummary.status) !== "ready") missingInputs.push("taskThroughputSummary");
  return missingInputs;
}

export function createUserAnalyticsDashboard({
  retentionSummary = null,
  projectCreationSummary = null,
  taskThroughputSummary = null,
} = {}) {
  const retention = normalizeObject(retentionSummary);
  const creation = normalizeObject(projectCreationSummary);
  const throughput = normalizeObject(taskThroughputSummary);

  return {
    ownerUserAnalytics: {
      ownerUserAnalyticsId: `owner-user-analytics:${slugify(retention?.retentionMetricsId ?? retention?.retentionSummaryId)}`,
      status: "ready",
      missingInputs: buildMissingInputs(retention, throughput),
      retentionStatus: normalizeString(retention?.status) ?? "ready",
      projectCreationStatus: normalizeString(creation?.status) ?? "not-required",
      throughputStatus: normalizeString(throughput?.status) ?? "ready",
    },
  };
}
