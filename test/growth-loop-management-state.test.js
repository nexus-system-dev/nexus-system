import test from "node:test";
import assert from "node:assert/strict";
import { createGrowthLoopManagementState } from "../src/core/growth-loop-management-state.js";

test("growth loop management state emits hypothesis and next action", () => {
  const { growthLoopManagement } = createGrowthLoopManagementState({
    conversionAnalytics: { conversionAnalyticsId: "conv-1", status: "ready" },
    launchPerformanceDashboard: { summaryCards: [{ label: "Website to activation" }] },
  });
  assert.equal(growthLoopManagement.status, "ready");
  assert.equal(growthLoopManagement.hypotheses.length, 1);
});
