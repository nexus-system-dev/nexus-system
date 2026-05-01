import test from "node:test";
import assert from "node:assert/strict";

import { createStateCoverageValidator } from "../src/core/state-coverage-validator.js";

test("createStateCoverageValidator accepts dashboard with loading empty and error", () => {
  const { stateCoverageValidation } = createStateCoverageValidator({
    screenId: "dashboard-screen",
    screenTemplate: {
      templateType: "dashboard",
    },
    screenStates: {
      screenType: "dashboard",
      states: {
        loading: { enabled: true },
        empty: { enabled: true },
        error: { enabled: true },
        success: { enabled: false },
      },
    },
  });

  assert.equal(stateCoverageValidation.summary.isValid, true);
  assert.deepEqual(stateCoverageValidation.summary.missingStates, []);
});

test("createStateCoverageValidator reports missing success on workflow", () => {
  const { stateCoverageValidation } = createStateCoverageValidator({
    screenId: "wizard-screen",
    screenTemplate: {
      templateType: "workflow",
    },
    screenStates: {
      screenType: "wizard",
      states: {
        loading: { enabled: true },
        error: { enabled: true },
        success: { enabled: false },
      },
    },
  });

  assert.equal(stateCoverageValidation.summary.isValid, false);
  assert.deepEqual(stateCoverageValidation.summary.missingStates, ["success"]);
  assert.deepEqual(stateCoverageValidation.blockingIssues, ["missing-success-state"]);
});

test("createStateCoverageValidator normalizes malformed identifiers and state payloads", () => {
  const { stateCoverageValidation } = createStateCoverageValidator({
    screenId: { bad: true },
    screenTemplate: {
      templateType: " management ",
    },
    screenStates: {
      screenType: " tracking ",
      states: "bad",
    },
  });

  assert.equal(stateCoverageValidation.validationId, "state-coverage-validation:tracking");
  assert.equal(stateCoverageValidation.screenId, null);
  assert.equal(stateCoverageValidation.screenType, "tracking");
  assert.equal(stateCoverageValidation.templateType, "management");
  assert.deepEqual(stateCoverageValidation.summary.requiredStates, ["loading", "empty", "error", "success"]);
  assert.deepEqual(stateCoverageValidation.summary.availableStates, []);
});
