import test from "node:test";
import assert from "node:assert/strict";

import { createGeneratedAccessibilityValidationEngine } from "../src/core/generated-accessibility-validation-engine.js";

test("generated accessibility validation engine marks a previewable labeled surface as ready", () => {
  const { generatedAccessibilityValidationEngine } = createGeneratedAccessibilityValidationEngine({
    renderableDesignProposal: {
      proposalId: "proposal:accessibility:1",
      screenId: "release-screen",
      ctaAnchors: [
        {
          ctaId: "cta-1",
          label: "Submit",
        },
      ],
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      regions: [
        { regionId: "region-1", slot: "hero", component: "header" },
        { regionId: "region-2", slot: "cta", component: "panel" },
      ],
      ctaAnchors: [
        { ctaId: "cta-1", label: "Submit", isVisible: true },
      ],
      tokens: {
        baseFontSize: 16,
      },
      meta: {
        isPreviewable: true,
      },
    },
    generatedSurfaceProofSchema: {
      status: "proven",
    },
  });

  assert.equal(generatedAccessibilityValidationEngine.status, "ready");
  assert.equal(generatedAccessibilityValidationEngine.summary.failedCheckCount, 0);
  assert.equal(generatedAccessibilityValidationEngine.evidence.labeledRegionCount, 2);
  assert.equal(generatedAccessibilityValidationEngine.evidence.labeledCtaCount, 1);
});

test("generated accessibility validation engine flags missing labels and unreadable baseline", () => {
  const { generatedAccessibilityValidationEngine } = createGeneratedAccessibilityValidationEngine({
    renderableDesignProposal: {
      proposalId: "proposal:accessibility:2",
      screenId: "release-screen",
      ctaAnchors: [],
    },
    previewScreenViewModel: {
      screenId: "release-screen",
      regions: [
        { regionId: "region-1", component: null, slot: null },
      ],
      ctaAnchors: [
        { ctaId: "cta-1", label: "", isVisible: true },
      ],
      tokens: {
        baseFontSize: 12,
      },
      meta: {
        isPreviewable: false,
      },
    },
    generatedSurfaceProofSchema: {
      status: "needs-attention",
    },
  });

  assert.equal(generatedAccessibilityValidationEngine.status, "needs-attention");
  assert.equal(generatedAccessibilityValidationEngine.summary.failedCheckCount >= 2, true);
  assert.equal(generatedAccessibilityValidationEngine.summary.warningCheckCount >= 1, true);
  assert.equal(generatedAccessibilityValidationEngine.evidence.previewable, false);
});
