import test from "node:test";
import assert from "node:assert/strict";

import { createRecommendationDisplayContract } from "../src/core/recommendation-display-contract.js";

test("recommendation display contract combines headline reasoning impact and CTA", () => {
  const { recommendationDisplay } = createRecommendationDisplayContract({
    projectExplanation: {
      explanationId: "project-explanation:1",
      headline: "צריך את האישור שלך כדי שנוכל להמשיך.",
      userSummary: "ההמלצה הזו תקדם את הפרויקט כרגע.",
      summary: {
        hasFailure: false,
      },
    },
    reasoningPanel: {
      headline: "This recommendation needs approval before it can move forward.",
    },
    nextTaskPresentation: {
      presentationId: "next-task-presentation:1",
      expectedOutcome: {
        headline: "Approve deploy",
        expectedImpact: "The release can continue",
      },
      selectedTask: {
        id: "approval-handoff:deploy",
        summary: "Approve deploy",
      },
      approvalState: {
        requiresApproval: true,
      },
      alternatives: ["wait-for-approval", "switch-to-safe-path"],
    },
  });

  assert.equal(recommendationDisplay.headline, "צריך את האישור שלך כדי שנוכל להמשיך.");
  assert.equal(recommendationDisplay.whyNow, "This recommendation needs approval before it can move forward.");
  assert.equal(recommendationDisplay.expectedImpact, "The release can continue");
  assert.equal(recommendationDisplay.primaryCta.intent, "approval");
  assert.equal(recommendationDisplay.summary.hasBlockers, true);
});

test("recommendation display contract falls back safely", () => {
  const { recommendationDisplay } = createRecommendationDisplayContract();

  assert.equal(typeof recommendationDisplay.displayId, "string");
  assert.equal(Array.isArray(recommendationDisplay.alternatives), true);
  assert.equal(typeof recommendationDisplay.summary.requiresApproval, "boolean");
});
