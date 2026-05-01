import test from "node:test";
import assert from "node:assert/strict";
import { createFounderAndProductStoryAssetBuilder } from "../src/core/founder-product-story-asset-builder.js";

test("founder and product story asset builder produces story assets", () => {
  const { storyAssets } = createFounderAndProductStoryAssetBuilder({
    nexusPositioning: { nexusPositioningId: "positioning-1", status: "ready", problem: "Teams stall", promise: "Nexus keeps them moving" },
    launchContentCalendar: { status: "ready", entries: [{}, { format: "launch-post" }] },
  });
  assert.equal(storyAssets.status, "ready");
  assert.equal(storyAssets.assets.length, 3);
});
