import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchDraftPublishingPlan } from "../src/core/launch-draft-publishing-plan.js";
test("launch draft publishing plan schedules drafts from calendar entries", () => {
  const { launchPublishingPlan } = createLaunchDraftPublishingPlan({ launchRolloutPlan: { launchRolloutPlanId: "rollout-1", status: "ready" }, launchContentCalendar: { status: "ready", entries: [{ phase: "pre-launch" }, { phase: "launch" }] } });
  assert.equal(launchPublishingPlan.status, "ready");
  assert.equal(launchPublishingPlan.drafts.length, 2);
});
