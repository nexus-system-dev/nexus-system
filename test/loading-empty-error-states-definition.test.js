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

test("loading empty error states definition ignores non-boolean state support flags", () => {
  const { screenStates } = createLoadingEmptyErrorStatesDefinition({
    screenContract: {
      screenType: "detail",
      stateSupport: {
        loading: "no",
        error: "yes",
        empty: null,
        success: 1,
      },
    },
  });

  assert.equal(screenStates.states.loading.enabled, true);
  assert.equal(screenStates.states.error.enabled, true);
  assert.equal(screenStates.states.empty.enabled, false);
  assert.equal(screenStates.states.success.enabled, false);
  assert.deepEqual(screenStates.summary.enabledStates, ["loading", "error"]);
});

test("loading empty error states definition normalizes unknown screen types to canonical detail", () => {
  const { screenStates } = createLoadingEmptyErrorStatesDefinition({
    screenContract: {
      screenType: "modal",
      stateSupport: {
        loading: true,
        error: true,
        empty: false,
        success: false,
      },
    },
  });

  assert.equal(screenStates.screenType, "detail");
  assert.equal(screenStates.stateDefinitionId, "screen-states:detail");
  assert.equal(screenStates.states.loading.description.includes("detail"), true);
});
