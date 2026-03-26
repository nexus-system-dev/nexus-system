import test from "node:test";
import assert from "node:assert/strict";

import { createScreenToFlowMapping } from "../src/core/screen-flow-map.js";

test("screen-to-flow mapping returns trigger and next action for each screen", () => {
  const { screenFlowMap } = createScreenToFlowMapping({
    screenInventory: {
      screens: [
        {
          screenId: "journey-onboarding:capture-intake",
          screenType: "wizard",
          journeyId: "journey-onboarding",
          flowType: "onboarding",
          stepId: "capture-intake",
        },
        {
          screenId: "journey-execution:track-progress",
          screenType: "dashboard",
          journeyId: "journey-execution",
          flowType: "execution",
          stepId: "track-progress",
        },
      ],
    },
    journeyMap: {
      flows: [
        {
          journeyId: "journey-onboarding",
          transitions: [{ fromStepId: "capture-intake", toStepId: "confirm-project", isTerminal: false }],
        },
        {
          journeyId: "journey-execution",
          transitions: [{ fromStepId: "track-progress", toStepId: null, isTerminal: true }],
        },
      ],
    },
  });

  assert.equal(screenFlowMap.summary.totalMappings, 2);
  assert.equal(screenFlowMap.mappings[0].trigger, "project-created");
  assert.equal(screenFlowMap.mappings[0].nextAction, "go-to:confirm-project");
  assert.equal(screenFlowMap.mappings[1].isTerminal, true);
});
