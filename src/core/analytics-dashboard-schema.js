// Task #172 — Define analytics dashboard schema
// Builds a unified schema for the Nexus product analytics dashboard.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function buildMetricPanel(key, label, value, trend) {
  return {
    panelKey: key,
    label,
    value: normalizeFiniteNumber(value),
    trend: normalizeString(trend) ?? "flat",
    isVisible: true,
  };
}

export function defineAnalyticsDashboardSchema({
  analyticsMetrics = null,
  timeRange = null,
  filters = null,
} = {}) {
  const metrics = normalizeObject(analyticsMetrics);
  const range = normalizeObject(timeRange);
  const appliedFilters = normalizeObject(filters);

  const schemaId = `analytics-dashboard-schema:${Date.now()}`;

  const panels = [
    buildMetricPanel("projects-created", "Projects Created", metrics.projectsCreated, metrics.projectsCreatedTrend),
    buildMetricPanel("tasks-completed", "Tasks Completed", metrics.tasksCompleted, metrics.tasksCompletedTrend),
    buildMetricPanel("time-saved-hours", "Time Saved (hrs)", metrics.timeSavedHours, metrics.timeSavedTrend),
    buildMetricPanel("active-users", "Active Users", metrics.activeUsers, metrics.activeUsersTrend),
    buildMetricPanel("retention-rate", "Retention Rate (%)", metrics.retentionRate, metrics.retentionTrend),
    buildMetricPanel("revenue", "Revenue", metrics.revenue, metrics.revenueTrend),
  ];

  return {
    analyticsDashboardSchema: {
      schemaId,
      timeRange: {
        start: normalizeString(range.start) ?? null,
        end: normalizeString(range.end) ?? null,
        granularity: normalizeString(range.granularity) ?? "daily",
      },
      appliedFilters,
      panels,
      panelCount: panels.length,
      meta: {
        hasMetrics: Object.keys(metrics).length > 0,
        hasFilters: Object.keys(appliedFilters).length > 0,
        schemaVersion: "1.0",
      },
    },
  };
}
