import { test } from "node:test";
import assert from "node:assert/strict";
import { defineRenderableScreenModel } from "../src/core/renderable-screen-model-schema.js";

test("defineRenderableScreenModel returns a valid model for minimal input", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({});
  assert.ok(renderableScreenModel.modelId);
  assert.ok(renderableScreenModel.screenId);
  assert.equal(typeof renderableScreenModel.currentPhase, "string");
  assert.equal(renderableScreenModel.meta.isRenderable, true);
});

test("defineRenderableScreenModel extracts screenId from screenContract", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenContract: { screenId: "screen:dashboard", title: "Dashboard", screenType: "dashboard" },
  });
  assert.equal(renderableScreenModel.screenId, "screen:dashboard");
  assert.equal(renderableScreenModel.screenType, "dashboard");
  assert.equal(renderableScreenModel.title, "Dashboard");
  assert.ok(renderableScreenModel.modelId.includes("screen:dashboard"));
});

test("defineRenderableScreenModel resolves phase from screenStates", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenStates: { phase: "loading" },
  });
  assert.equal(renderableScreenModel.currentPhase, "loading");
});

test("defineRenderableScreenModel falls back to populated phase for unknown phase", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenStates: { phase: "unknown-phase" },
  });
  assert.equal(renderableScreenModel.currentPhase, "populated");
});

test("defineRenderableScreenModel builds CTA anchors from screenContract", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenContract: {
      screenId: "s1",
      ctaDefinitions: [
        { ctaId: "cta-1", label: "Submit", anchor: "primary", actionIntent: "submit" },
        { ctaId: "cta-2", label: "Cancel", anchor: "ghost", actionIntent: "cancel" },
      ],
    },
  });
  assert.equal(renderableScreenModel.ctaAnchors.length, 2);
  assert.equal(renderableScreenModel.ctaAnchors[0].anchor, "primary");
  assert.equal(renderableScreenModel.ctaAnchors[1].anchor, "ghost");
  assert.equal(renderableScreenModel.meta.hasCtaAnchors, true);
});

test("defineRenderableScreenModel filters out CTA anchors with no label", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenContract: {
      ctaDefinitions: [
        { label: "Valid" },
        { label: "" },
        {},
      ],
    },
  });
  assert.equal(renderableScreenModel.ctaAnchors.length, 1);
  assert.equal(renderableScreenModel.ctaAnchors[0].label, "Valid");
});

test("defineRenderableScreenModel builds template variant index", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    templateVariants: [
      { variantKey: "loading", templateId: "t-loading", conditions: [{ phase: "loading" }] },
      { variantKey: "populated", templateId: "t-populated", conditions: [{ phase: "populated" }] },
    ],
  });
  assert.ok(renderableScreenModel.templateVariantIndex.loading);
  assert.ok(renderableScreenModel.templateVariantIndex.populated);
  assert.equal(renderableScreenModel.meta.requiresStateResolution, true);
});

test("defineRenderableScreenModel builds component boundaries from componentContract", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    componentContract: {
      regions: [
        { regionId: "header", componentType: "header", slotKey: "slot-header" },
        { regionId: "content", componentType: "panel", slotKey: "slot-content" },
      ],
    },
  });
  assert.equal(renderableScreenModel.componentBoundaries.length, 2);
  assert.equal(renderableScreenModel.componentBoundaries[0].regionId, "header");
});

test("defineRenderableScreenModel handles null inputs gracefully", () => {
  const { renderableScreenModel } = defineRenderableScreenModel({
    screenContract: null,
    designTokens: null,
    screenStates: null,
  });
  assert.ok(renderableScreenModel);
  assert.equal(renderableScreenModel.meta.isRenderable, true);
});
