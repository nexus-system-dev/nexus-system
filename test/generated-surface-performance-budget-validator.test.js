import test from "node:test";
import assert from "node:assert/strict";

import { createGeneratedSurfacePerformanceBudgetValidator } from "../src/core/generated-surface-performance-budget-validator.js";

test("generated surface performance budget validator marks a previewable low-load surface as within budget", () => {
  const { generatedSurfacePerformanceBudgetValidator } = createGeneratedSurfacePerformanceBudgetValidator({
    renderableDesignProposal: {
      proposalId: "proposal-release",
      screenId: "release-screen",
      layoutType: "single-column",
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      layoutType: "single-column",
      regions: [
        { regionId: "hero" },
        { regionId: "timeline" },
        { regionId: "approval" },
      ],
      ctaAnchors: [{ ctaId: "cta-1", isVisible: true }],
      tokens: {
        baseFontSize: 16,
      },
      meta: {
        regionCount: 3,
        isPreviewable: true,
      },
    },
    generatedSurfaceProofSchema: {
      proofId: "generated-surface-proof:proposal-release",
      status: "proven",
    },
    generatedAccessibilityValidationEngine: {
      validationEngineId: "generated-accessibility:proposal-release",
      status: "ready",
    },
  });

  assert.equal(generatedSurfacePerformanceBudgetValidator.status, "ready");
  assert.equal(generatedSurfacePerformanceBudgetValidator.summary.budgetStatus, "within-budget");
  assert.equal(generatedSurfacePerformanceBudgetValidator.summary.failedCheckCount, 0);
  assert.equal(generatedSurfacePerformanceBudgetValidator.evidence.weightedSurfaceLoad, 4);
});

test("generated surface performance budget validator flags above-budget preview load", () => {
  const { generatedSurfacePerformanceBudgetValidator } = createGeneratedSurfacePerformanceBudgetValidator({
    renderableDesignProposal: {
      proposalId: "proposal-dense",
      screenId: "dense-screen",
      layoutType: "single-column",
    },
    previewScreenViewModel: {
      screenId: "dense-screen",
      layoutType: "single-column",
      regions: new Array(7).fill(null).map((_, index) => ({ regionId: `region-${index + 1}` })),
      ctaAnchors: [
        { ctaId: "cta-1", isVisible: true },
        { ctaId: "cta-2", isVisible: true },
        { ctaId: "cta-3", isVisible: true },
      ],
      tokens: {
        baseFontSize: 12,
      },
      meta: {
        regionCount: 7,
        isPreviewable: true,
      },
    },
    generatedSurfaceProofSchema: {
      proofId: "generated-surface-proof:proposal-dense",
      status: "needs-attention",
    },
    generatedAccessibilityValidationEngine: {
      validationEngineId: "generated-accessibility:proposal-dense",
      status: "needs-attention",
    },
  });

  assert.equal(generatedSurfacePerformanceBudgetValidator.status, "needs-attention");
  assert.equal(generatedSurfacePerformanceBudgetValidator.summary.budgetStatus, "above-budget");
  assert.equal(generatedSurfacePerformanceBudgetValidator.summary.failedCheckCount >= 2, true);
  assert.equal(generatedSurfacePerformanceBudgetValidator.evidence.visibleCtaCount, 3);
});
