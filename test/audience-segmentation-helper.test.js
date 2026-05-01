import test from "node:test";
import assert from "node:assert/strict";

import { deriveAudienceSegments } from "../src/core/audience-segmentation-helper.js";

test("audience segmentation helper derives canonical segments from positioning business context and project identity", () => {
  const result = deriveAudienceSegments({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:operators",
      audience: "product operators",
      problem: "Teams lose momentum",
    },
    businessContext: {
      targetAudience: "founders",
    },
    projectIdentity: {
      audience: "product operators",
    },
  });

  assert.equal(result.audienceSegmentsId, "audience-segments:nexus-positioning-operators");
  assert.deepEqual(result.segments, [
    {
      segmentId: "audience-segment:operators",
      segmentType: "operators",
      label: "product operators",
      source: "nexusPositioning.audience",
    },
    {
      segmentId: "audience-segment:founders",
      segmentType: "founders",
      label: "founders",
      source: "businessContext.targetAudience",
    },
  ]);
});

test("audience segmentation helper falls back to a general audience when only positioning problem exists", () => {
  const result = deriveAudienceSegments({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:general",
      problem: "Teams lose momentum",
    },
  });

  assert.equal(result.segments.length, 1);
  assert.equal(result.segments[0].segmentType, "general");
  assert.equal(result.segments[0].source, "fallback");
});
