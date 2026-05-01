import test from "node:test";
import assert from "node:assert/strict";

import { createNexusWebsiteCopyPack } from "../src/core/nexus-website-copy-pack.js";

test("nexus website copy pack derives ready copy from website, landing, messaging, FAQ, and CTA state", () => {
  const { websiteCopyPack } = createNexusWebsiteCopyPack({
    nexusWebsiteSchema: {
      nexusWebsiteSchemaId: "website-schema:operators",
      status: "ready",
    },
    landingPageIa: {
      status: "ready",
      sections: [
        { sectionId: "section:hero", title: "Hero" },
        { sectionId: "section:proof", title: "Proof" },
      ],
    },
    messagingFramework: {
      status: "ready",
      headline: "Nexus executes scoped work with governed multi-agent flows",
      subheadline: "Teams lose momentum between planning and execution",
      valueProps: [{ label: "execution-native system" }],
    },
    objectionMap: {
      status: "ready",
      entries: [{ concern: "new workflow adoption", response: "Start scoped, not full-stack." }],
    },
    faqMap: {
      status: "ready",
      entries: [{ question: "Who is Nexus for?", answer: "Product operators." }],
    },
    productCtaStrategy: {
      status: "ready",
      primaryCta: { ctaId: "cta:request-access", label: "Request access" },
    },
  });

  assert.equal(websiteCopyPack.status, "ready");
  assert.deepEqual(websiteCopyPack.missingInputs, []);
  assert.equal(websiteCopyPack.pageCopy.length, 2);
  assert.equal(websiteCopyPack.pageCopy[0].ctaLabel, "Request access");
  assert.equal(websiteCopyPack.faqEntries.length, 1);
});

test("nexus website copy pack exposes missing-inputs when prerequisites are absent", () => {
  const { websiteCopyPack } = createNexusWebsiteCopyPack();

  assert.equal(websiteCopyPack.status, "missing-inputs");
  assert.deepEqual(websiteCopyPack.missingInputs, [
    "nexusWebsiteSchema",
    "landingPageIa",
    "messagingFramework",
    "objectionMap",
    "faqMap",
    "productCtaStrategy",
  ]);
});
