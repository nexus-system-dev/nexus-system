import test from "node:test";
import assert from "node:assert/strict";
import { createFirstTouchAttributionRecorder } from "../src/core/first-touch-attribution-recorder.js";

test("first touch attribution recorder captures variant and source", () => {
  const { firstTouchAttribution } = createFirstTouchAttributionRecorder({
    visitorContext: { channelIntent: "evaluation" },
    landingVariantDecision: { landingVariantDecisionId: "landing-1", status: "ready", acquisitionSource: "community", selectedVariantId: "variant-1" },
    productCtaStrategy: { status: "ready", primaryCta: { ctaId: "cta:request-access" } },
  });
  assert.equal(firstTouchAttribution.status, "ready");
  assert.equal(firstTouchAttribution.source, "community");
});
