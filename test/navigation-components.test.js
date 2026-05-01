import test from "node:test";
import assert from "node:assert/strict";

import { createNavigationComponents } from "../src/core/navigation-components.js";

test("createNavigationComponents builds canonical navigation component library", () => {
  const { navigationComponents } = createNavigationComponents({
    screenFlowMap: {
      mappings: [
        {
          screenId: "screen:onboarding",
          flowType: "onboarding",
          stepId: "intake",
        },
        {
          screenId: "screen:development",
          flowType: "execution",
          stepId: "workbench",
        },
      ],
    },
  });

  assert.equal(navigationComponents.components.length, 5);
  assert.equal(navigationComponents.components[0].componentType, "sidebar");
  assert.deepEqual(navigationComponents.components[0].preview.items, ["Developer", "Project Brain", "Release"]);
  assert.deepEqual(navigationComponents.components[4].navigationRules.supportsStepIds, ["intake", "workbench"]);
  assert.equal(navigationComponents.components[4].preview.activeItem, "Analysis");
  assert.equal(navigationComponents.summary.totalComponents, 5);
  assert.equal(navigationComponents.summary.totalFlowTypes, 2);
  assert.equal(navigationComponents.summary.supportsWorkspaceNavigation, true);
});

test("createNavigationComponents falls back safely without explicit mappings", () => {
  const { navigationComponents } = createNavigationComponents();

  assert.equal(navigationComponents.components.length, 5);
  assert.equal(navigationComponents.components[2].componentType, "breadcrumb");
  assert.deepEqual(navigationComponents.components[2].preview.items, ["Project", "Developer", "Execution"]);
  assert.equal(navigationComponents.summary.supportsWorkspaceNavigation, true);
});

test("createNavigationComponents normalizes invalid mapping payloads to canonical flow and step lists", () => {
  const { navigationComponents } = createNavigationComponents({
    screenFlowMap: {
      mappings: [
        {
          flowType: " execution ",
          stepId: " workbench ",
        },
        {
          flowType: 42,
          stepId: {},
        },
        "bad",
        null,
      ],
    },
  });

  assert.deepEqual(navigationComponents.components[0].navigationRules.supportsFlowTypes, ["execution"]);
  assert.deepEqual(navigationComponents.components[2].navigationRules.supportsStepIds, ["workbench"]);
  assert.deepEqual(navigationComponents.components[4].navigationRules.supportsStepIds, ["workbench"]);
  assert.equal(navigationComponents.navigationComponentLibraryId, "navigation-components:2");
  assert.equal(navigationComponents.summary.totalFlowTypes, 1);
});

test("createNavigationComponents ignores non-object screen flow maps", () => {
  const { navigationComponents } = createNavigationComponents({
    screenFlowMap: {
      mappings: "invalid",
    },
  });

  assert.equal(navigationComponents.navigationComponentLibraryId, "navigation-components:nexus");
  assert.deepEqual(navigationComponents.components[0].navigationRules.supportsFlowTypes, []);
  assert.deepEqual(navigationComponents.components[4].navigationRules.supportsStepIds, []);
});
