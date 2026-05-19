import test from "node:test";
import assert from "node:assert/strict";

import { createGrowthOpportunitySurfacingBoundary } from "../src/core/growth-opportunity-surfacing-boundary.js";

test("growth opportunity boundary stays bounded when continuation is active", () => {
  const { growthOpportunitySurfacingBoundary } = createGrowthOpportunitySurfacingBoundary({
    productClass: "landing-page",
    postReleaseContinuationLoop: {
      status: "active",
      continuationMoves: [
        "לחדד את ההבטחה הראשית מעל הקפל",
        "לחזק את בלוק האמון שמצדיק את ההמשך",
      ],
    },
  });

  assert.equal(growthOpportunitySurfacingBoundary.status, "bounded");
  assert.equal(growthOpportunitySurfacingBoundary.statusLabel, "הצעות ההמשך נשארות bounded");
  assert.equal(growthOpportunitySurfacingBoundary.allowedMoves[0], "לחדד את ההבטחה הראשית מעל הקפל");
  assert.match(growthOpportunitySurfacingBoundary.disallowedMoves[0], /disconnected/);
});
