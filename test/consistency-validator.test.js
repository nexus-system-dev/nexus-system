import test from "node:test";
import assert from "node:assert/strict";

import { createConsistencyValidator } from "../src/core/consistency-validator.js";

test("createConsistencyValidator passes when template, tokens and components are aligned", () => {
  const { consistencyValidation } = createConsistencyValidator({
    screenId: "dashboard-screen",
    screenTemplate: {
      templateType: "dashboard",
      sections: {
        topbar: { enabled: true },
      },
      composition: {
        primaryComponents: ["table", "status-chip"],
      },
    },
    designTokens: {
      colors: { accent: "#0f766e", border: "#d6d3d1" },
      spacing: { md: 12, lg: 20 },
    },
    componentLibrary: {
      components: [
        { componentType: "table" },
        { componentType: "status-chip" },
      ],
    },
  });

  assert.equal(consistencyValidation.summary.isConsistent, true);
  assert.deepEqual(consistencyValidation.summary.missingComponents, []);
});

test("createConsistencyValidator reports missing components and token families", () => {
  const { consistencyValidation } = createConsistencyValidator({
    screenId: "broken-screen",
    screenTemplate: {
      templateType: "management",
      sections: {},
      composition: {
        primaryComponents: ["table", "badge"],
      },
    },
    designTokens: {
      colors: {},
      spacing: {},
    },
    componentLibrary: {
      components: [{ componentType: "table" }],
    },
  });

  assert.equal(consistencyValidation.summary.isConsistent, false);
  assert.deepEqual(consistencyValidation.summary.missingComponents, ["badge"]);
  assert.deepEqual(consistencyValidation.blockingIssues, [
    "missing-color-tokens",
    "missing-spacing-tokens",
    "missing-template-sections",
    "missing-component:badge",
  ]);
});
