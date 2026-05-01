import test from "node:test";
import assert from "node:assert/strict";
import { createNexusLaunchCampaignBrief } from "../src/core/nexus-launch-campaign-brief.js";

test("nexus launch campaign brief derives launch channels and success criteria", () => {
  const { launchCampaignBrief } = createNexusLaunchCampaignBrief({
    nexusPositioning: { nexusPositioningId: "positioning-1", status: "ready", audience: "product teams", promise: "Keep execution moving" },
    businessContext: { kpis: ["activation-rate"] },
  });
  assert.equal(launchCampaignBrief.status, "ready");
  assert.equal(launchCampaignBrief.channels.length, 3);
});
