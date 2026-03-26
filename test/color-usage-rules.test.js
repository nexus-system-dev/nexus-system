import test from "node:test";
import assert from "node:assert/strict";

import { createColorUsageRules } from "../src/core/color-usage-rules.js";

test("color usage rules returns semantic color mapping for roles and states", () => {
  const { colorRules } = createColorUsageRules({
    designTokens: {
      tokenSetId: "design-tokens:nexus",
      colors: {
        canvas: "#f5f1e8",
        surface: "#fffaf0",
        ink: "#1f2933",
        muted: "#6b7280",
        accent: "#0f766e",
        accentStrong: "#115e59",
        success: "#15803d",
        warning: "#b45309",
        danger: "#b91c1c",
        border: "#d6d3d1",
      },
    },
  });

  assert.equal(colorRules.roles.accent.token, "#0f766e");
  assert.equal(colorRules.roles.textPrimary.usage.includes("body text"), true);
  assert.equal(colorRules.states.warning.token, "#b45309");
  assert.equal(colorRules.summary.hasSemanticStates, true);
});

test("color usage rules falls back safely without design tokens", () => {
  const { colorRules } = createColorUsageRules({});

  assert.equal(typeof colorRules.colorRulesId, "string");
  assert.equal(typeof colorRules.roles.surface.token, "string");
  assert.equal(typeof colorRules.states.danger.token, "string");
});
