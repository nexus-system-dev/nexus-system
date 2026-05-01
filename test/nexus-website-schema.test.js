import test from "node:test";
import assert from "node:assert/strict";

import { defineNexusWebsiteSchema } from "../src/core/nexus-website-schema.js";

test("nexus website schema builds canonical pages from messaging and CTA strategy", () => {
  const { nexusWebsiteSchema } = defineNexusWebsiteSchema({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
    },
    productCtaStrategy: {
      status: "ready",
      primaryCta: {
        ctaId: "cta:request-access",
        label: "Request access",
      },
      secondaryCtas: [
        {
          ctaId: "cta:book-demo",
          label: "Book demo",
        },
      ],
    },
  });

  assert.equal(nexusWebsiteSchema.status, "ready");
  assert.deepEqual(nexusWebsiteSchema.missingInputs, []);
  assert.equal(nexusWebsiteSchema.pages.length, 5);
  assert.equal(nexusWebsiteSchema.pages[0].pageId, "page:home");
  assert.equal(nexusWebsiteSchema.pages[0].primaryCta.label, "Request access");
});

test("nexus website schema exposes missing-inputs when CTA strategy is absent", () => {
  const { nexusWebsiteSchema } = defineNexusWebsiteSchema({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
    },
  });

  assert.equal(nexusWebsiteSchema.status, "missing-inputs");
  assert.deepEqual(nexusWebsiteSchema.missingInputs, ["productCtaStrategy"]);
  assert.deepEqual(nexusWebsiteSchema.pages, []);
});
