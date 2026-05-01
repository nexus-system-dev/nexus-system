import test from "node:test";
import assert from "node:assert/strict";
import { createSocialAndCommunityContentPack } from "../src/core/social-community-content-pack.js";

test("social and community content pack maps story assets into channel assets", () => {
  const { socialCommunityPack } = createSocialAndCommunityContentPack({
    storyAssets: { storyAssetsId: "story-1", status: "ready", assets: [{ title: "Asset 1" }, { title: "Asset 2" }] },
    launchContentCalendar: { status: "ready", entries: [{ phase: "pre-launch" }, { phase: "launch" }] },
  });
  assert.equal(socialCommunityPack.status, "ready");
  assert.equal(socialCommunityPack.assets.length, 2);
});
