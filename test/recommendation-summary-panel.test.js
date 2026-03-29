import test from "node:test";
import assert from "node:assert/strict";

import { createRecommendationSummaryPanel } from "../src/core/recommendation-summary-panel.js";

test("recommendation summary panel shows active recommendation urgency and expected outcome", () => {
  const { recommendationSummaryPanel } = createRecommendationSummaryPanel({
    recommendationDisplay: {
      displayId: "recommendation-display:1",
      headline: "Approve deploy",
      whyNow: "This recommendation needs approval before it can move forward.",
      expectedImpact: "The release can continue",
      blockers: ["approval-required"],
      alternatives: ["wait-for-approval"],
      primaryCta: {
        actionId: "approval-handoff:deploy",
        intent: "approval",
      },
      summary: {
        requiresApproval: true,
      },
    },
    projectBrainWorkspace: {
      blockers: [{ blockerId: "approval-1" }],
    },
  });

  assert.equal(recommendationSummaryPanel.headline, "Approve deploy");
  assert.equal(recommendationSummaryPanel.urgency, "high");
  assert.equal(recommendationSummaryPanel.expectedOutcome, "The release can continue");
  assert.equal(recommendationSummaryPanel.summary.requiresApproval, true);
});

test("recommendation summary panel falls back safely", () => {
  const { recommendationSummaryPanel } = createRecommendationSummaryPanel();

  assert.equal(typeof recommendationSummaryPanel.panelId, "string");
  assert.equal(Array.isArray(recommendationSummaryPanel.blockers), true);
  assert.equal(typeof recommendationSummaryPanel.summary.blockerCount, "number");
});
