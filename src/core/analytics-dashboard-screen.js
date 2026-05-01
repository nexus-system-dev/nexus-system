// Task #175 — Create analytics dashboard screen
// Builds an internal dashboard screen model for Nexus metrics.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function buildDashboardWidget(panelKey, label, value, trend) {
  return {
    widgetId: `widget:${panelKey}`,
    label: label ?? panelKey,
    value,
    trend: normalizeString(trend) ?? "flat",
    displayType: typeof value === "number" ? "metric" : "text",
    isVisible: true,
  };
}

export function createAnalyticsDashboardScreen({
  analyticsPayload = null,
} = {}) {
  const payload = normalizeObject(analyticsPayload);
  const summary = normalizeObject(payload.summary ?? payload.analyticsSummary);

  const screenId = `analytics-dashboard-screen:${Date.now()}`;

  const widgets = [
    buildDashboardWidget("projects-created", "Projects Created", summary.totalProjectsCreated ?? 0, null),
    buildDashboardWidget("tasks-completed", "Tasks Completed", summary.totalTasksCompleted ?? 0, null),
    buildDashboardWidget("time-saved", "Time Saved (ms)", summary.totalTimeSavedMs ?? 0, null),
    buildDashboardWidget("active-users", "Active Users", summary.totalReturningUsers ?? 0, null),
    buildDashboardWidget("revenue", "Revenue", summary.totalRevenue ?? 0, null),
  ];

  const hasData = Object.keys(summary).length > 0;

  return {
    analyticsDashboard: {
      screenId,
      title: "Nexus Analytics Dashboard",
      widgets,
      widgetCount: widgets.length,
      timeRange: normalizeObject(payload.timeRange),
      appliedFilters: normalizeObject(payload.appliedFilters),
      meta: {
        hasData,
        isInternal: true,
        screenType: "analytics",
      },
    },
  };
}
