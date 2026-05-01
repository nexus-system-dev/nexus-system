// Task #173 — Create analytics summary assembler
// Aggregates project creation, tasks, time saved, retention and revenue into a single summary.

function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function normalizeFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export function createAnalyticsSummaryAssembler({
  projectCreationSummary = null,
  taskThroughputSummary = null,
  productivitySummary = null,
  retentionSummary = null,
  revenueSummary = null,
} = {}) {
  const creation = normalizeObject(projectCreationSummary);
  const throughput = normalizeObject(taskThroughputSummary);
  const productivity = normalizeObject(productivitySummary);
  const retention = normalizeObject(retentionSummary);
  const revenue = normalizeObject(revenueSummary);

  const summaryId = `analytics-summary:${Date.now()}`;

  const totalProjectsCreated = normalizeFiniteNumber(creation.totalProjectsCreated ?? creation.count);
  const totalTasksCompleted = normalizeFiniteNumber(throughput.totalTasksCompleted ?? throughput.count);
  const totalTimeSavedMs = normalizeFiniteNumber(productivity.totalTimeSavedMs ?? productivity.timeSavedMs);
  const totalReturningUsers = normalizeFiniteNumber(retention.totalReturningUsers);
  const totalRevenue = normalizeFiniteNumber(revenue.totalRevenue ?? revenue.revenue);

  const sourcesProvided = [
    creation, throughput, productivity, retention, revenue
  ].filter((s) => Object.keys(s).length > 0).length;

  return {
    analyticsSummary: {
      summaryId,
      totalProjectsCreated,
      totalTasksCompleted,
      totalTimeSavedMs,
      totalReturningUsers,
      totalRevenue,
      sourcesProvided,
      meta: {
        isComplete: sourcesProvided === 5,
        hasProductivityData: Object.keys(productivity).length > 0,
        hasRevenueData: Object.keys(revenue).length > 0,
        hasRetentionData: Object.keys(retention).length > 0,
      },
    },
  };
}
