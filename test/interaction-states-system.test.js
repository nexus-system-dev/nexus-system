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
