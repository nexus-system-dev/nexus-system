import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchChannelRolloutPlan } from "../src/core/launch-channel-rollout-plan.js";
test("launch channel rollout plan maps brief channels to rollout entries", () => {
  const { launchRolloutPlan } = createLaunchChannelRolloutPlan({ launchCampaignBrief: { launchCampaignBriefId: "brief-1", status: "ready", channels: ["website", "email"] }, socialCommunityPack: { status: "ready", assets: [{}] } });
  assert.equal(launchRolloutPlan.status, "ready");
  assert.equal(launchRolloutPlan.channels.length, 2);
});
