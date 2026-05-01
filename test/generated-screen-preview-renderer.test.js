import { test } from "node:test";
import assert from "node:assert/strict";
import { createGeneratedScreenPreviewRenderer } from "../src/core/generated-screen-preview-renderer.js";

test("createGeneratedScreenPreviewRenderer returns valid view model for empty input", () => {
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({});
  assert.ok(previewScreenViewModel.viewModelId);
  assert.equal(typeof previewScreenViewModel.currentPhase, "string");
  assert.equal(Array.isArray(previewScreenViewModel.regions), true);
  assert.ok(previewScreenViewModel.tokens);
  assert.equal(previewScreenViewModel.meta.previewMode, "generated");
});

test("createGeneratedScreenPreviewRenderer resolves design token values", () => {
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    designTokens: {
      primaryColor: "#FF0000",
      backgroundColor: "#FFFFFF",
      fontFamily: "Inter",
      baseFontSize: 14,
    },
  });
  assert.equal(previewScreenViewModel.tokens.primaryColor, "#FF0000");
  assert.equal(previewScreenViewModel.tokens.fontFamily, "Inter");
  assert.equal(previewScreenViewModel.tokens.baseFontSize, 14);
});

test("createGeneratedScreenPreviewRenderer builds preview regions from composition", () => {
  const renderableScreenComposition = {
    renderableScreenComposition: {
      compositionId: "comp-1",
      screenId: "s1",
      currentPhase: "populated",
      activeVariantKey: "default",
      layoutType: "single-column",
      sectionRhythm: "comfortable",
      regions: [
        { regionId: "r1", slot: "slot-1", order: 1, component: "header", isApproved: true, isVisible: true },
        { regionId: "r2", slot: "slot-2", order: 2, component: "panel", isApproved: true, isVisible: true },
      ],
      ctaAnchors: [],
      meta: { isRenderable: true },
    },
  };
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    renderableScreenComposition,
  });
  assert.equal(previewScreenViewModel.regions.length, 2);
  assert.equal(previewScreenViewModel.regions[0].component, "header");
  assert.equal(previewScreenViewModel.meta.regionCount, 2);
  assert.equal(previewScreenViewModel.meta.isPreviewable, true);
});

test("createGeneratedScreenPreviewRenderer filters out invisible regions", () => {
  const renderableScreenComposition = {
    renderableScreenComposition: {
      screenId: "s2",
      regions: [
        { regionId: "r1", order: 1, component: "header", isVisible: true, isApproved: true },
        { regionId: "r2", order: 2, component: "panel", isVisible: false, isApproved: true },
      ],
      ctaAnchors: [],
      meta: { isRenderable: true },
    },
  };
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    renderableScreenComposition,
  });
  assert.equal(previewScreenViewModel.regions.length, 1);
  assert.equal(previewScreenViewModel.regions[0].component, "header");
});

test("createGeneratedScreenPreviewRenderer maps CTA anchors with preview styles", () => {
  const renderableScreenComposition = {
    renderableScreenComposition: {
      screenId: "s3",
      regions: [],
      ctaAnchors: [
        { ctaId: "cta-1", label: "Submit", anchor: "primary", actionIntent: "submit", isVisible: true, isDisabled: false },
      ],
      meta: { isRenderable: true },
    },
  };
  const { previewScreenViewModel } = createGeneratedScreenPreviewRenderer({
    renderableScreenComposition,
    designTokens: { primaryColor: "#0057FF" },
  });
  assert.equal(previewScreenViewModel.ctaAnchors.length, 1);
  assert.equal(previewScreenViewModel.ctaAnchors[0].label, "Submit");
  assert.ok(previewScreenViewModel.ctaAnchors[0].previewStyles.backgroundColor);
  assert.equal(previewScreenViewModel.meta.hasCtaAnchors, true);
});
