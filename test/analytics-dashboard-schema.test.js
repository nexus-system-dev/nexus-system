import { test } from "node:test";
import assert from "node:assert/strict";
import { defineAnalyticsDashboardSchema } from "../src/core/analytics-dashboard-schema.js";

test("defineAnalyticsDashboardSchema returns valid schema for empty input", () => {
  const { analyticsDashboardSchema } = defineAnalyticsDashboardSchema({});
  assert.ok(analyticsDashboardSchema.schemaId);
  assert.equal(Array.isArray(analyticsDashboardSchema.panels), true);
  assert.equal(analyticsDashboardSchema.panelCount, 6);
});

test("defineAnalyticsDashboardSchema builds panels from analyticsMetrics", () => {
  const { analyticsDashboardSchema } = defineAnalyticsDashboardSchema({
    analyticsMetrics: { projectsCreated: 42, activeUsers: 100, revenue: 9999 },
  });
  const projectPanel = analyticsDashboardSchema.panels.find((p) => p.panelKey === "projects-created");
  assert.equal(projectPanel.value, 42);
  assert.equal(analyticsDashboardSchema.meta.hasMetrics, true);
});

test("defineAnalyticsDashboardSchema applies timeRange", () => {
  const { analyticsDashboardSchema } = defineAnalyticsDashboardSchema({
    timeRange: { start: "2026-01-01", end: "2026-04-01", granularity: "weekly" },
  });
  assert.equal(analyticsDashboardSchema.timeRange.granularity, "weekly");
  assert.equal(analyticsDashboardSchema.timeRange.start, "2026-01-01");
});
