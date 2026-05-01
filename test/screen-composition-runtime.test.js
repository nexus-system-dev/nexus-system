import { test } from "node:test";
import assert from "node:assert/strict";
import { createScreenCompositionRuntime } from "../src/core/screen-composition-runtime.js";

test("createScreenCompositionRuntime returns a valid composition for empty input", () => {
  const { renderableScreenComposition } = createScreenCompositionRuntime({});
  assert.ok(renderableScreenComposition.compositionId);
  assert.equal(typeof renderableScreenComposition.currentPhase, "string");
  assert.equal(Array.isArray(renderableScreenComposition.regions), true);
  assert.equal(typeof renderableScreenComposition.meta.isRenderable, "boolean");
});

test("createScreenCompositionRuntime assembles regions from layout and mapping", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s1",
      modelId: "renderable:s1",
      currentPhase: "populated",
      designTokenRef: {},
      ctaAnchors: [],
    },
  };
  const layoutCompositionPlan = {
    layoutCompositionPlan: {
      screenId: "s1",
      layoutType: "single-column",
      sectionRhythm: "comfortable",
      regions: [
        { regionId: "r1", slot: "slot-1", order: 1 },
        { regionId: "r2", slot: "slot-2", order: 2 },
      ],
    },
  };
  const screenComponentMapping = {
    screenComponentMapping: {
      mappings: [
        { regionId: "r1", resolvedComponent: "header", isApproved: true, slotKey: "slot-1" },
        { regionId: "r2", resolvedComponent: "panel", isApproved: true, slotKey: "slot-2" },
      ],
    },
  };
  const activeScreenVariantPlan = {
    activeScreenVariantPlan: {
      currentPhase: "populated",
      activeVariantKey: "default",
      activeVariant: { overrides: {} },
    },
  };

  const { renderableScreenComposition } = createScreenCompositionRuntime({
    renderableScreenModel,
    layoutCompositionPlan,
    screenComponentMapping,
    activeScreenVariantPlan,
  });

  assert.equal(renderableScreenComposition.screenId, "s1");
  assert.equal(renderableScreenComposition.regions.length, 2);
  assert.equal(renderableScreenComposition.regions[0].component, "header");
  assert.equal(renderableScreenComposition.meta.isFullyApproved, true);
  assert.equal(renderableScreenComposition.meta.isRenderable, true);
});

test("createScreenCompositionRuntime composition is not renderable with 0 visible regions", () => {
  const layoutCompositionPlan = {
    layoutCompositionPlan: { regions: [] },
  };
  const { renderableScreenComposition } = createScreenCompositionRuntime({ layoutCompositionPlan });
  assert.equal(renderableScreenComposition.meta.isRenderable, false);
});

test("createScreenCompositionRuntime applies variant overrides to region components", () => {
  const layoutCompositionPlan = {
    layoutCompositionPlan: {
      regions: [{ regionId: "r1", slot: "slot-1", order: 1 }],
    },
  };
  const activeScreenVariantPlan = {
    activeScreenVariantPlan: {
      currentPhase: "loading",
      activeVariantKey: "loading-variant",
      activeVariant: {
        overrides: { r1: { component: "progress", isVisible: true } },
      },
    },
  };
  const { renderableScreenComposition } = createScreenCompositionRuntime({
    layoutCompositionPlan,
    activeScreenVariantPlan,
  });
  assert.equal(renderableScreenComposition.regions[0].component, "progress");
  assert.equal(renderableScreenComposition.activeVariantKey, "loading-variant");
});
