import test from "node:test";
import assert from "node:assert/strict";

import { createPrimitiveComponents } from "../src/core/primitive-components.js";

test("createPrimitiveComponents builds canonical primitive component library", () => {
  const { primitiveComponents } = createPrimitiveComponents({
    componentContract: {
      componentContractId: "component-contract:button",
      behavior: {
        supportsStates: ["hover", "active", "focus", "disabled", "destructive"],
      },
    },
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      colors: {
        accent: "#0f766e",
        surface: "#fffaf0",
        border: "#d6d3d1",
        ink: "#1f2933",
        danger: "#b91c1c",
      },
      spacing: {
        sm: 8,
        md: 12,
      },
      radius: {
        sm: 6,
        md: 12,
        pill: 999,
      },
      typography: {
        sizeSm: 14,
      },
    },
  });

  assert.equal(primitiveComponents.componentLibraryId, "primitive-components:design-tokens:nexus");
  assert.equal(primitiveComponents.baseContractId, "component-contract:button");
  assert.equal(primitiveComponents.components.length, 6);
  assert.equal(primitiveComponents.components[0].componentType, "button");
  assert.deepEqual(primitiveComponents.components[0].states, ["hover", "active", "focus", "disabled", "destructive"]);
  assert.equal(primitiveComponents.components[4].interactive, false);
  assert.equal(primitiveComponents.summary.totalComponents, 6);
  assert.equal(primitiveComponents.summary.includesFormPrimitives, true);
});

test("createPrimitiveComponents falls back safely without explicit inputs", () => {
  const { primitiveComponents } = createPrimitiveComponents();

  assert.equal(primitiveComponents.baseContractId, "component-contract:panel");
  assert.equal(primitiveComponents.components.length, 6);
  assert.equal(primitiveComponents.components[5].componentType, "icon-button");
  assert.equal(primitiveComponents.summary.interactiveComponents, 5);
});
