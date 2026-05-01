import test from "node:test";
import assert from "node:assert/strict";

import { createObjectionAndFaqMap } from "../src/core/objection-faq-map.js";

test("objection and FAQ map derives ready outputs from messaging and project signals", () => {
  const { objectionMap, faqMap } = createObjectionAndFaqMap({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "ready",
      audience: "product operators",
      headline: "Nexus executes scoped work with governed multi-agent flows",
      subheadline: "Teams lose momentum between planning and execution",
      valueProps: [
        { valuePropId: "value-prop:execution-native", label: "execution-native system" },
      ],
      objections: [
        {
          objectionId: "objection:new-workflow-adoption",
          concern: "new workflow adoption",
          response: "Nexus starts with scoped work instead of forcing a full operating-system reset.",
        },
      ],
      ctaAngles: [
        {
          ctaAngleId: "cta-angle:start-execution",
          label: "Start with a scoped project",
          reason: "Execution starts from a scoped project.",
        },
      ],
    },
    businessContext: {
      targetAudience: "product operators",
      gtmStage: "build",
      constraints: ["defaults-need-confirmation"],
    },
    projectIdentity: {
      audience: "product operators",
      tone: "direct",
    },
    manualContext: {
      competitiveContext: {
        strengths: ["governed automation"],
      },
    },
  });

  assert.equal(objectionMap.status, "ready");
  assert.equal(faqMap.status, "ready");
  assert.equal(objectionMap.entries.length >= 2, true);
  assert.equal(faqMap.entries.length >= 3, true);
  assert.equal(faqMap.entries[0].question, "Who is Nexus for?");
});

test("objection and FAQ map exposes missing-inputs when messaging framework is not ready", () => {
  const { objectionMap, faqMap } = createObjectionAndFaqMap({
    messagingFramework: {
      messagingFrameworkId: "messaging-framework:nexus-positioning:operators",
      status: "missing-inputs",
    },
  });

  assert.equal(objectionMap.status, "missing-inputs");
  assert.equal(faqMap.status, "missing-inputs");
  assert.deepEqual(objectionMap.missingInputs, ["messagingFramework"]);
  assert.deepEqual(faqMap.entries, []);
});
