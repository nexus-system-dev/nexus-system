import { test } from "node:test";
import assert from "node:assert/strict";
import { createTemplateToLayoutEngine } from "../src/core/template-to-layout-engine.js";

test("createTemplateToLayoutEngine returns a layout plan for empty input", () => {
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({});
  assert.ok(layoutCompositionPlan.planId);
  assert.equal(typeof layoutCompositionPlan.layoutType, "string");
  assert.equal(Array.isArray(layoutCompositionPlan.regions), true);
});

test("createTemplateToLayoutEngine resolves layoutType from renderableScreenModel", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      modelId: "renderable:s1",
      screenId: "s1",
      template: { layoutKey: "two-column", sections: [] },
    },
  };
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({ renderableScreenModel });
  assert.equal(layoutCompositionPlan.layoutType, "two-column");
});

test("createTemplateToLayoutEngine builds regions from template sections", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      modelId: "renderable:s2",
      screenId: "s2",
      template: {
        layoutKey: "single-column",
        sections: [
          { sectionId: "header", label: "Header", slot: "slot-header", order: 1 },
          { sectionId: "content", label: "Content", slot: "slot-content", order: 2 },
        ],
      },
    },
  };
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({ renderableScreenModel });
  assert.equal(layoutCompositionPlan.regions.length, 2);
  assert.equal(layoutCompositionPlan.regions[0].slot, "slot-header");
  assert.equal(layoutCompositionPlan.regions[1].slot, "slot-content");
  assert.equal(layoutCompositionPlan.meta.regionCount, 2);
});

test("createTemplateToLayoutEngine defaults to comfortable section rhythm", () => {
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({});
  assert.equal(layoutCompositionPlan.sectionRhythm, "comfortable");
});

test("createTemplateToLayoutEngine resolves wizard-step for wizard layout key", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      template: { layoutKey: "wizard-step", sections: [] },
    },
  };
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({ renderableScreenModel });
  assert.equal(layoutCompositionPlan.layoutType, "wizard-step");
});

test("createTemplateToLayoutEngine builds hierarchy with slots", () => {
  const renderableScreenModel = {
    renderableScreenModel: {
      screenId: "s3",
      template: {
        layoutKey: "grid",
        sections: [
          { sectionId: "a", slot: "slot-a" },
          { sectionId: "b", slot: "slot-b" },
        ],
      },
    },
  };
  const { layoutCompositionPlan } = createTemplateToLayoutEngine({ renderableScreenModel });
  assert.equal(layoutCompositionPlan.hierarchy.root, "screen-root");
  assert.deepEqual(layoutCompositionPlan.hierarchy.slots, ["slot-a", "slot-b"]);
});
