import test from "node:test";
import assert from "node:assert/strict";

import { createInteractionStatesSystem } from "../src/core/interaction-states-system.js";

test("createInteractionStatesSystem builds canonical interaction states from design tokens", () => {
  const { interactionStateSystem } = createInteractionStatesSystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      colors: {
        accent: "#0f766e",
        accentStrong: "#115e59",
        muted: "#6b7280",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
      },
      borders: {
        subtle: 1,
        strong: 2,
        focus: 3,
      },
      shadows: {
        soft: "soft-shadow",
        medium: "medium-shadow",
        focus: "focus-shadow",
      },
    },
  });

  assert.equal(interactionStateSystem.interactionStateSystemId, "interaction-states:design-tokens:nexus");
  assert.equal(interactionStateSystem.states.hover.emphasisColor, "#115e59");
  assert.equal(interactionStateSystem.states.focus.shadow, "focus-shadow");
  assert.equal(interactionStateSystem.states.disabled.borderWidth, 1);
  assert.equal(interactionStateSystem.states.destructive.emphasisColor, "#b91c1c");
  assert.equal(interactionStateSystem.states.success.emphasisColor, "#15803d");
  assert.equal(interactionStateSystem.summary.totalStates, 7);
  assert.equal(interactionStateSystem.summary.accessibleFocusTreatment, true);
});

test("createInteractionStatesSystem falls back to default interaction values", () => {
  const { interactionStateSystem } = createInteractionStatesSystem();

  assert.equal(interactionStateSystem.states.hover.emphasisColor, "#115e59");
  assert.equal(interactionStateSystem.states.focus.borderWidth, 3);
  assert.equal(interactionStateSystem.states.warning.emphasisColor, "#b45309");
  assert.equal(interactionStateSystem.summary.includesSemanticInteractionStates, true);
});

test("createInteractionStatesSystem normalizes invalid token identity and interaction payload values", () => {
  const { interactionStateSystem } = createInteractionStatesSystem({
    designTokens: {
      tokenSetId: { invalid: true },
      colors: {
        accent: 42,
        accentStrong: ["bad"],
        muted: "",
        success: null,
        warning: false,
        danger: {},
      },
      borders: {
        subtle: 0,
        strong: "2px",
        focus: Number.NaN,
      },
      shadows: {
        soft: 12,
        medium: null,
        focus: {},
      },
    },
  });

  assert.equal(interactionStateSystem.interactionStateSystemId, "interaction-states:nexus");
  assert.equal(interactionStateSystem.states.hover.emphasisColor, "#115e59");
  assert.equal(interactionStateSystem.states.hover.borderWidth, 2);
  assert.equal(interactionStateSystem.states.focus.borderWidth, 3);
  assert.equal(interactionStateSystem.states.focus.shadow, "0 0 0 3px rgba(15, 118, 110, 0.18)");
  assert.equal(interactionStateSystem.states.disabled.emphasisColor, "#6b7280");
  assert.equal(interactionStateSystem.states.success.emphasisColor, "#15803d");
  assert.equal(interactionStateSystem.states.warning.emphasisColor, "#b45309");
  assert.equal(interactionStateSystem.states.destructive.emphasisColor, "#b91c1c");
});

test("createInteractionStatesSystem ignores non-object token groups and emits safe defaults", () => {
  const { interactionStateSystem } = createInteractionStatesSystem({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      colors: "invalid",
      borders: 3,
      shadows: null,
    },
  });

  assert.equal(interactionStateSystem.interactionStateSystemId, "interaction-states:design-tokens:nexus");
  assert.equal(interactionStateSystem.states.hover.emphasisColor, "#115e59");
  assert.equal(interactionStateSystem.states.active.shadow, "0 12px 32px rgba(15, 23, 42, 0.12)");
  assert.equal(interactionStateSystem.states.focus.borderWidth, 3);
  assert.equal(interactionStateSystem.states.disabled.borderWidth, 1);
});
