import { test } from "node:test";
import assert from "node:assert/strict";
import { createAnalyticsDashboardScreen } from "../src/core/analytics-dashboard-screen.js";

test("createAnalyticsDashboardScreen returns valid dashboard for empty input", () => {
  const { analyticsDashboard } = createAnalyticsDashboardScreen({});
  assert.ok(analyticsDashboard.screenId);
  assert.equal(analyticsDashboard.title, "Nexus Analytics Dashboard");
  assert.equal(Array.isArray(analyticsDashboard.widgets), true);
  assert.equal(analyticsDashboard.widgetCount, 5);
});

test("createAnalyticsDashboardScreen builds widgets from analytics payload summary", () => {
  const { analyticsDashboard } = createAnalyticsDashboardScreen({
    analyticsPayload: {
      summary: { totalProjectsCreated: 15, totalTasksCompleted: 80 },
    },
  });
  const projectWidget = analyticsDashboard.widgets.find((w) => w.widgetId === "widget:projects-created");
  assert.equal(projectWidget.value, 15);
  assert.equal(analyticsDashboard.meta.hasData, true);
  assert.equal(analyticsDashboard.meta.isInternal, true);
});
