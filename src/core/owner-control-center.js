function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerControlPlane) {
  const missingInputs = [];
  if (!ownerControlPlane || normalizeString(ownerControlPlane.status) !== "ready") {
    missingInputs.push("ownerControlPlane");
  }
  return missingInputs;
}

function summarizeMaintenanceBacklog(maintenanceBacklog) {
  const backlog = normalizeObject(maintenanceBacklog);
  const items = Array.isArray(backlog?.items) ? backlog.items : [];
  const severityRank = { high: 3, medium: 2, low: 1 };
  const highestSeverity = items
    .map((item) => normalizeString(item?.severity) ?? "low")
    .sort((left, right) => (severityRank[right] ?? 0) - (severityRank[left] ?? 0))[0] ?? "none";

  return {
    status: normalizeString(backlog?.status) ?? "not-required",
    taskCount: items.length,
    highestSeverity,
    requiresOwnerAttention:
      normalizeString(backlog?.status) === "ready"
      && items.length > 0,
  };
}

export function createOwnerControlCenter({
  ownerControlPlane = null,
  analyticsSummary = null,
  platformTrace = null,
  maintenanceBacklog = null,
} = {}) {
  const normalizedPlane = normalizeObject(ownerControlPlane);
  const normalizedAnalytics = normalizeObject(analyticsSummary);
  const normalizedTrace = normalizeObject(platformTrace);
  const missingInputs = buildMissingInputs(normalizedPlane);

  if (missingInputs.length > 0) {
    return {
      ownerControlCenter: {
        ownerControlCenterId: `owner-center:${slugify(normalizedPlane?.ownerControlPlaneId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const maintenanceSummary = summarizeMaintenanceBacklog(maintenanceBacklog);

  return {
    ownerControlCenter: {
      ownerControlCenterId: `owner-center:${slugify(normalizedPlane.ownerControlPlaneId)}`,
      status: "ready",
      missingInputs: [],
      healthStatus: normalizeString(normalizedPlane.healthStatus) ?? "stable",
      analyticsStatus: normalizeString(normalizedAnalytics?.status) ?? "not-required",
      traceId: normalizeString(normalizedTrace?.traceId),
      recommendedActionCount: 3 + (maintenanceSummary.requiresOwnerAttention ? 1 : 0),
      maintenanceStatus: maintenanceSummary.status,
      maintenanceTaskCount: maintenanceSummary.taskCount,
      maintenanceUrgency: maintenanceSummary.highestSeverity,
      requiresMaintenanceReview: maintenanceSummary.requiresOwnerAttention,
    },
  };
}
