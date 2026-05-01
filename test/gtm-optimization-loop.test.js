import test from "node:test";
import assert from "node:assert/strict";
import { createGtmOptimizationLoop } from "../src/core/gtm-optimization-loop.js";

test("gtm optimization loop emits recommendations", () => {
  const { gtmOptimizationPlan } = createGtmOptimizationLoop({
    launchPerformanceDashboard: { launchPerformanceDashboardId: "dashboard-1", status: "ready" },
    launchFeedbackSummary: { topThemes: ["trust proof"] },
  });
  assert.equal(gtmOptimizationPlan.status, "ready");
  assert.equal(gtmOptimizationPlan.recommendations[0].area, "messaging");
});
