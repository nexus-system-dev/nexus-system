import test from "node:test";
import assert from "node:assert/strict";
import { createReEngagementTriggerPlanner } from "../src/core/re-engagement-trigger-planner.js";

test("re-engagement trigger planner maps drop offs into follow up actions", () => {
  const { reEngagementPlan } = createReEngagementTriggerPlanner({
    activationDropOffs: { activationDropOffsId: "drops-1", status: "ready", entries: [{ reason: "session-idle" }] },
    notificationPreferences: { email: { enabled: true } },
  });
  assert.equal(reEngagementPlan.status, "ready");
  assert.equal(reEngagementPlan.actions[0].channel, "email");
});
