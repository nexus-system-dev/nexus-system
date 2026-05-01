import test from "node:test";
import assert from "node:assert/strict";

import { createAudienceSpecificMessagingVariants } from "../src/core/audience-specific-messaging-variants.js";

test("audience-specific messaging variants build ready variants from messaging framework and local audience segments", () => {
  const { messagingVariants } = createAudienceSpecificMessagingVariants({
    coreMessagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
      headline: "Nexus executes scoped work with governed multi-agent flows",
      subheadline: "Teams lose momentum between planning and execution",
      valueProps: [{ valuePropId: "value-prop:execution-native", label: "execution-native system" }],
      ctaAngles: [{ ctaAngleId: "cta-angle:start-execution", label: "Start with a scoped project", reason: "Nexus executes scoped work" }],
    },
    nexusPositioning: {
      promise: "Nexus executes scoped work with governed multi-agent flows",
      audience: "product operators",
    },
    businessContext: {
      targetAudience: "founders",
    },
    projectIdentity: {
      audience: "product operators",
    },
  });

  assert.equal(messagingVariants.status, "ready");
  assert.deepEqual(messagingVariants.missingInputs, []);
  assert.equal(messagingVariants.segments.length, 2);
  assert.equal(messagingVariants.variants.length, 2);
  assert.equal(messagingVariants.variants[0].segmentType, "operators");
  assert.equal(messagingVariants.variants[0].headline, "Nexus executes scoped work with governed multi-agent flows for product operators");
});

test("audience-specific messaging variants expose missing-inputs when messaging framework is not ready", () => {
  const { messagingVariants } = createAudienceSpecificMessagingVariants({
    coreMessagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "missing-inputs",
    },
    nexusPositioning: {
      audience: "product operators",
      problem: "Teams lose momentum",
    },
  });

  assert.equal(messagingVariants.status, "missing-inputs");
  assert.deepEqual(messagingVariants.missingInputs, ["messagingFramework"]);
  assert.equal(messagingVariants.segments.length, 1);
  assert.deepEqual(messagingVariants.variants, []);
});
