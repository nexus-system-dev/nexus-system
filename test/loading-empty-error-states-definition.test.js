import test from "node:test";
import assert from "node:assert/strict";

import { createLoadingEmptyErrorStatesDefinition } from "../src/core/loading-empty-error-states-definition.js";

test("loading empty error states definition returns canonical states for dashboard screen", () => {
  const { screenStates } = createLoadingEmptyErrorStatesDefinition({
    screenId: "project-dashboard",
    title: "Project Dashboard",
    screenContract: {
      screenType: "dashboard",
      stateSupport: {
        loading: true,
        empty: true,
        error: true,
        success: false,
      },
    },
  });

  assert.equal(screenStates.screenType, "dashboard");
  assert.equal(screenStates.states.loading.enabled, true);
  assert.equal(screenStates.states.empty.enabled, true);
  assert.equal(screenStates.states.error.enabled, true);
  assert.equal(screenStates.states.success.enabled, false);
  assert.equal(Array.isArray(screenStates.summary.enabledStates), true);
  assert.equal(screenStates.summary.enabledStates.includes("empty"), true);
});

test("loading empty error states definition falls back safely for partial input", () => {
  const { screenStates } = createLoadingEmptyErrorStatesDefinition({});

  assert.equal(screenStates.screenType, "detail");
  assert.equal(typeof screenStates.stateDefinitionId, "string");
  assert.equal(screenStates.states.loading.enabled, true);
  assert.equal(screenStates.states.error.enabled, true);
});
