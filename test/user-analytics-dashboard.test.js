import test from "node:test";
import assert from "node:assert/strict";
import { createUserAnalyticsDashboard } from "../src/core/user-analytics-dashboard.js";
test("user analytics dashboard emits ready analytics view", () => {
  const { ownerUserAnalytics } = createUserAnalyticsDashboard({
    retentionSummary: { retentionMetricsId: "retention-1", status: "ready" },
    projectCreationSummary: { status: "ready" },
    taskThroughputSummary: { status: "ready" },
  });
  assert.equal(ownerUserAnalytics.status, "ready");
});
