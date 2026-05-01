// Task #174 — Create analytics API
// Builds endpoints payload for Nexus analytics metrics and summaries.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeString(value) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildEndpointDescriptor(path, method, description, outputKey) {
  return { path, method, description, outputKey, isAvailable: true };
}

export function createAnalyticsApi({
  analyticsSummary = null,
  timeRange = null,
  filters = null,
} = {}) {
  const summary = normalizeObject(analyticsSummary);
  const range = normalizeObject(timeRange);
  const appliedFilters = normalizeObject(filters);

  const apiId = `analytics-api:${Date.now()}`;

  const endpoints = [
    buildEndpointDescriptor("/analytics/summary", "GET", "Get aggregated analytics summary", "analyticsSummary"),
    buildEndpointDescriptor("/analytics/projects", "GET", "Get project creation metrics", "projectCreationSummary"),
    buildEndpointDescriptor("/analytics/tasks", "GET", "Get task throughput metrics", "taskThroughputSummary"),
    buildEndpointDescriptor("/analytics/productivity", "GET", "Get productivity and time-saved metrics", "productivitySummary"),
    buildEndpointDescriptor("/analytics/retention", "GET", "Get user retention metrics", "retentionSummary"),
    buildEndpointDescriptor("/analytics/revenue", "GET", "Get revenue metrics", "revenueSummary"),
  ];

  const analyticsPayload = {
    payloadId: `analytics-payload:${Date.now()}`,
    summary,
    timeRange: {
      start: normalizeString(range.start) ?? null,
      end: normalizeString(range.end) ?? null,
      granularity: normalizeString(range.granularity) ?? "daily",
    },
    appliedFilters,
    recordCount: Object.keys(summary).length > 0 ? 1 : 0,
  };

  return {
    analyticsPayload,
    analyticsApi: {
      apiId,
      endpoints,
      endpointCount: endpoints.length,
      meta: {
        hasSummaryData: Object.keys(summary).length > 0,
        hasFilters: Object.keys(appliedFilters).length > 0,
        isReady: true,
      },
    },
  };
}
