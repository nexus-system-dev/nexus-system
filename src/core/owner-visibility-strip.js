function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

export function createOwnerVisibilityStripForHomeDashboard({
  unifiedHomeDashboard = null,
  ownerControlCenter = null,
  ownerDecisionDashboard = null,
  dailyOwnerOverview = null,
} = {}) {
  const dashboard = normalizeObject(unifiedHomeDashboard);
  const controlCenter = normalizeObject(ownerControlCenter);
  const decisionDashboard = normalizeObject(ownerDecisionDashboard);
  const overview = normalizeObject(dailyOwnerOverview);

  return {
    ownerVisibilityStrip: {
      ownerVisibilityStripId: `owner-visibility-strip:${dashboard.unifiedHomeDashboardId ?? "anonymous"}`,
      status: dashboard.status === "ready" ? "ready" : "blocked",
      metrics: [
        { metricId: "maintenance", label: "Maintenance", value: controlCenter.maintenanceTaskCount ?? 0 },
        { metricId: "recommendations", label: "Recommendations", value: decisionDashboard.recommendedActionCount ?? 0 },
        { metricId: "issues", label: "Open issues", value: overview.openIssues ?? 0 },
      ],
      summary: {
        requiresAttention: controlCenter.requiresMaintenanceReview === true || (overview.openIssues ?? 0) > 0,
        headline: controlCenter.maintenanceStatus ?? decisionDashboard.summary?.headline ?? "Owner visibility ready",
      },
    },
  };
}
