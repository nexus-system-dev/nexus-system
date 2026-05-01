import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchMarketingExecutionTracker } from "../src/core/launch-marketing-execution-tracker.js";
test("launch marketing execution tracker summarizes published steps and feedback clusters", () => {
  const { launchMarketingExecution } = createLaunchMarketingExecutionTracker({ promotionExecutionPlan: { promotionExecutionPlanId: "plan-1", status: "ready", steps: [{}, {}] }, launchFeedbackSummary: { status: "ready", clusters: [{}] } });
  assert.equal(launchMarketingExecution.status, "ready");
  assert.equal(launchMarketingExecution.publishedCount, 2);
});
