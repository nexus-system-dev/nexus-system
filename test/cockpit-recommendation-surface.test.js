import test from "node:test";
import assert from "node:assert/strict";

import { createCockpitRecommendationSurface } from "../src/core/cockpit-recommendation-surface.js";

test("cockpit recommendation surface combines explanation approval reasoning and summary panel", () => {
  const { cockpitRecommendationSurface } = createCockpitRecommendationSurface({
    projectExplanation: {
      explanationId: "project-explanation:1",
      headline: "צריך את האישור שלך כדי שנוכל להמשיך.",
      userSummary: "המערכת ממליצה לאשר את הצעד הבא.",
    },
    approvalExplanation: {
      whyApproval: "השינוי הזה דורש אישור לפני שנמשיך",
      whatIfRejected: "נישאר במסלול בטוח יותר",
      riskLevel: "high",
    },
    reasoningPanel: {
      headline: "This recommendation needs approval before it can move forward.",
    },
    recommendationSummaryPanel: {
      panelId: "recommendation-summary-panel:1",
      headline: "Approve deploy",
      reason: "The release is ready except for approval.",
      urgency: "high",
      expectedOutcome: "The release can continue",
      blockers: ["approval-required"],
      primaryCta: {
        label: "Approve deploy",
      },
      summary: {
        requiresApproval: true,
      },
    },
  });

  assert.equal(cockpitRecommendationSurface.headline, "Approve deploy");
  assert.equal(cockpitRecommendationSurface.approval.requiresApproval, true);
  assert.equal(cockpitRecommendationSurface.summaryMeta.blockerCount, 1);
});
