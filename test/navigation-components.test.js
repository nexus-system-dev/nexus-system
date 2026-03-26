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
  assert.deepEqual(navigationComponents.components[4].navigationRules.supportsStepIds, ["intake", "workbench"]);
  assert.equal(navigationComponents.summary.totalComponents, 5);
  assert.equal(navigationComponents.summary.totalFlowTypes, 2);
  assert.equal(navigationComponents.summary.supportsWorkspaceNavigation, true);
});

test("createNavigationComponents falls back safely without explicit mappings", () => {
  const { navigationComponents } = createNavigationComponents();

  assert.equal(navigationComponents.components.length, 5);
  assert.equal(navigationComponents.components[2].componentType, "breadcrumb");
  assert.equal(navigationComponents.summary.supportsWorkspaceNavigation, true);
});
