import test from "node:test";
import assert from "node:assert/strict";
import { createPromotionExecutionPlanner } from "../src/core/promotion-execution-planner.js";
test("promotion execution planner maps drafts to rollout channels", () => {
  const { promotionExecutionPlan } = createPromotionExecutionPlanner({ launchRolloutPlan: { launchRolloutPlanId: "rollout-1", status: "ready", channels: [{ channel: "website" }] }, launchPublishingPlan: { status: "ready", drafts: [{ draftId: "draft-1" }] } });
  assert.equal(promotionExecutionPlan.status, "ready");
  assert.equal(promotionExecutionPlan.steps.length, 1);
});
