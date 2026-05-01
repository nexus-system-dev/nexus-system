import test from "node:test";
import assert from "node:assert/strict";
import { createActivationDropOffDetector } from "../src/core/activation-drop-off-detector.js";

test("activation drop off detector flags unreached milestones", () => {
  const { activationDropOffs } = createActivationDropOffDetector({
    activationMilestones: { activationMilestonesId: "milestones-1", status: "ready", milestones: [{ milestoneId: "m1", milestone: "first-visible-result", reached: false }] },
    userActivityEvent: { activityType: "session-idle" },
  });
  assert.equal(activationDropOffs.status, "ready");
  assert.equal(activationDropOffs.entries.length, 1);
});
