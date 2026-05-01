import test from "node:test";
import assert from "node:assert/strict";

import { createTrustProofBlockBuilder } from "../src/core/trust-proof-block-builder.js";

test("trust proof block builder creates proof blocks from messaging and objections", () => {
  const { trustProofBlocks } = createTrustProofBlockBuilder({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:operators",
      status: "ready",
      headline: "Nexus executes scoped work with governed multi-agent flows",
      valueProps: [{ label: "execution-native system" }],
    },
    objectionMap: {
      status: "ready",
      entries: [{ response: "Start scoped, not with a full reset." }],
    },
    landingPageIa: {
      sections: [{ sectionId: "section:proof" }],
    },
  });

  assert.equal(trustProofBlocks.status, "ready");
  assert.equal(trustProofBlocks.blocks.length, 3);
  assert.equal(trustProofBlocks.blocks[2].title, "Built into the landing flow");
});
