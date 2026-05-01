function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(ownerControlCenter) {
  const missingInputs = [];
  if (!ownerControlCenter || normalizeString(ownerControlCenter.status) !== "ready") {
    missingInputs.push("ownerControlCenter");
  }
  return missingInputs;
}

export function createDailyOverviewGenerator({
  ownerControlCenter = null,
  platformLogs = null,
  incidentAlert = null,
  maintenanceBacklog = null,
} = {}) {
  const normalizedCenter = normalizeObject(ownerControlCenter);
  const normalizedIncident = normalizeObject(incidentAlert);
  const normalizedMaintenanceBacklog = normalizeObject(maintenanceBacklog);
  const missingInputs = buildMissingInputs(normalizedCenter);

  if (missingInputs.length > 0) {
    return {
      dailyOwnerOverview: {
        dailyOwnerOverviewId: `owner-overview:${slugify(normalizedCenter?.ownerControlCenterId)}`,
        status: "missing-inputs",
        missingInputs,
      },
    };
  }

  const maintenanceTaskCount = Array.isArray(normalizedMaintenanceBacklog?.items)
    ? normalizedMaintenanceBacklog.items.length
    : 0;
  const maintenanceHeadline =
    normalizeString(normalizedCenter?.maintenanceStatus) === "ready" && maintenanceTaskCount > 0
      ? `Maintenance backlog requires attention (${maintenanceTaskCount})`
      : null;

  return {
    dailyOwnerOverview: {
      dailyOwnerOverviewId: `owner-overview:${slugify(normalizedCenter.ownerControlCenterId)}`,
      status: "ready",
      missingInputs: [],
      overviewHeadline: maintenanceHeadline ?? normalizeString(normalizedIncident?.summary) ?? "Owner overview is ready",
      openIssues: Math.max(Array.isArray(platformLogs) ? Math.min(platformLogs.length, 5) : 0, maintenanceTaskCount),
      decisionCount: normalizedCenter.recommendedActionCount ?? 0,
      maintenanceTaskCount,
      requiresMaintenanceReview: normalizedCenter?.requiresMaintenanceReview === true,
    },
  };
}
