import test from "node:test";
import assert from "node:assert/strict";

import { createPersonaSpecificLandingVariantResolver } from "../src/core/persona-specific-landing-variant-resolver.js";

test("landing variant resolver prefers visitor persona over default", () => {
  const { landingVariantDecision } = createPersonaSpecificLandingVariantResolver({
    messagingVariants: {
      messagingVariantsId: "messaging-variants:core",
      status: "ready",
      variants: [
        { variantId: "variant:general", segmentType: "general", audienceLabel: "General", headline: "General headline" },
        { variantId: "variant:operators", segmentType: "operators", audienceLabel: "Product operators", headline: "Operators headline" },
      ],
    },
    visitorContext: {
      persona: "product operators",
      channelIntent: "evaluation",
    },
    acquisitionSourceMetrics: {
      status: "ready",
      entries: [{ source: "community" }],
    },
  });

  assert.equal(landingVariantDecision.status, "ready");
  assert.equal(landingVariantDecision.selectedVariantId, "variant:operators");
  assert.equal(landingVariantDecision.matchReason, "visitor-persona");
});
