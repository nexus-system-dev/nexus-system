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
  assert.equal(primitiveComponents.components[0].preview.text, "שלח לאישור");
  assert.equal(primitiveComponents.components[4].interactive, false);
  assert.deepEqual(primitiveComponents.components[4].preview.items, ["Ready", "Partial", "Blocked"]);
  assert.equal(primitiveComponents.previewSurface.supportsLivePreview, true);
  assert.equal(primitiveComponents.summary.totalComponents, 6);
  assert.equal(primitiveComponents.summary.includesFormPrimitives, true);
});

test("createPrimitiveComponents falls back safely without explicit inputs", () => {
  const { primitiveComponents } = createPrimitiveComponents();

  assert.equal(primitiveComponents.baseContractId, "component-contract:panel");
  assert.equal(primitiveComponents.components.length, 6);
  assert.equal(primitiveComponents.components[5].componentType, "icon-button");
  assert.equal(primitiveComponents.components[5].preview.icon, "⋯");
  assert.equal(primitiveComponents.summary.interactiveComponents, 5);
});

test("createPrimitiveComponents normalizes invalid contract identity, states, and token values", () => {
  const { primitiveComponents } = createPrimitiveComponents({
    componentContract: {
      componentContractId: { invalid: true },
      behavior: {
        supportsStates: ["hover", "", null, "focus", 12],
      },
    },
    designTokens: {
      tokenSetId: ["bad"],
      colors: {
        accent: 99,
        surface: null,
        border: false,
        ink: {},
        danger: [],
      },
      spacing: {
        sm: 0,
        md: "12",
      },
      radius: {
        sm: -4,
        md: Number.NaN,
        pill: "full",
      },
      typography: {
        sizeSm: Infinity,
      },
    },
  });

  assert.equal(primitiveComponents.componentLibraryId, "primitive-components:nexus");
  assert.equal(primitiveComponents.baseContractId, "component-contract:panel");
  assert.deepEqual(primitiveComponents.components[0].states, ["hover", "focus"]);
  assert.equal(primitiveComponents.components[0].tokens.accentColor, "#0f766e");
  assert.equal(primitiveComponents.components[0].tokens.textColor, "#fffaf0");
  assert.equal(primitiveComponents.components[0].tokens.spacingX, 12);
  assert.equal(primitiveComponents.components[0].tokens.spacingY, 8);
  assert.equal(primitiveComponents.components[1].tokens.borderColor, "#d6d3d1");
  assert.equal(primitiveComponents.components[4].tokens.radius, 999);
  assert.equal(primitiveComponents.components[5].tokens.size, 14);
});

test("createPrimitiveComponents ignores non-object token groups and invalid state payloads", () => {
  const { primitiveComponents } = createPrimitiveComponents({
    componentContract: {
      componentContractId: "component-contract:button",
      behavior: {
        supportsStates: "focus",
      },
    },
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      colors: "invalid",
      spacing: 3,
      radius: null,
      typography: "small",
    },
  });

  assert.equal(primitiveComponents.componentLibraryId, "primitive-components:design-tokens:nexus");
  assert.deepEqual(primitiveComponents.components[0].states, ["hover", "active", "focus", "disabled"]);
  assert.equal(primitiveComponents.components[0].tokens.accentColor, "#0f766e");
  assert.equal(primitiveComponents.components[1].tokens.radius, 6);
  assert.equal(primitiveComponents.components[5].tokens.size, 14);
});
