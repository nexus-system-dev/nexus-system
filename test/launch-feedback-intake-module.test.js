import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchFeedbackIntakeModule } from "../src/core/launch-feedback-intake-module.js";
test("launch feedback intake module groups launch signals into summary clusters", () => {
  const { launchFeedbackSummary } = createLaunchFeedbackIntakeModule({ launchPublishingPlan: { launchPublishingPlanId: "publish-1", status: "ready" }, feedbackSignals: [{ topic: "pricing" }] });
  assert.equal(launchFeedbackSummary.status, "ready");
  assert.equal(launchFeedbackSummary.clusters.length, 1);
});
