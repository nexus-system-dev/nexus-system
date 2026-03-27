import test from "node:test";
import assert from "node:assert/strict";

import { createPassiveLearningDisclosureBanner } from "../src/core/passive-learning-disclosure-banner.js";

test("passive learning disclosure banner is visible when learning insights exist", () => {
  const { learningDisclosure } = createPassiveLearningDisclosureBanner({
    learningInsights: {
      insightSetId: "giftwallet",
      summary: "Similar approval patterns keep influencing the recommendation.",
      items: [{ id: "insight-1", title: "Approval-first rollout copy works better" }],
    },
  });

  assert.equal(learningDisclosure.bannerId, "learning-disclosure:giftwallet");
  assert.equal(learningDisclosure.visible, true);
  assert.equal(learningDisclosure.summary.isPassiveOnly, true);
});

test("passive learning disclosure banner falls back safely when no insights exist", () => {
  const { learningDisclosure } = createPassiveLearningDisclosureBanner();

  assert.equal(typeof learningDisclosure.headline, "string");
  assert.equal(learningDisclosure.visible, false);
  assert.equal(learningDisclosure.summary.hasLearningInsights, false);
});
