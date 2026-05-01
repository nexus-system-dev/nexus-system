function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : null;
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function slugify(value) {
  return normalizeString(value)?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "unknown";
}

function buildMissingInputs(userActivityEvent) {
  const missingInputs = [];
  if (!userActivityEvent || normalizeString(userActivityEvent.status) !== "ready") missingInputs.push("userActivityEvent");
  return missingInputs;
}

export function createFeatureUsageTracker({
  userActivityEvent = null,
  analyticsSummary = null,
} = {}) {
  const activity = normalizeObject(userActivityEvent);
  const analytics = normalizeObject(analyticsSummary);

  return {
    featureUsageSummary: {
      featureUsageSummaryId: `feature-usage:${slugify(activity?.eventId)}`,
      status: "ready",
      missingInputs: buildMissingInputs(activity),
      activeSurface: normalizeString(activity?.currentSurface) ?? "workspace",
      analyticsStatus: normalizeString(analytics?.status) ?? "not-required",
    },
  };
}
