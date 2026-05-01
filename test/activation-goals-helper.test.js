import test from "node:test";
import assert from "node:assert/strict";

import { deriveActivationGoals } from "../src/core/activation-goals-helper.js";

test("activation goals helper derives activation goals from positioning onboarding and project creation truth", () => {
  const { activationGoals } = deriveActivationGoals({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:operators",
      status: "ready",
      audience: "product operators",
    },
    onboardingCompletionDecision: {
      isComplete: true,
      requiresClarification: false,
    },
    projectCreationSummary: {
      totalProjectsCreated: 2,
    },
  });

  assert.equal(activationGoals.status, "ready");
  assert.deepEqual(activationGoals.missingInputs, []);
  assert.equal(activationGoals.goals[0].goalType, "request-access");
  assert.equal(activationGoals.goals[2].goalType, "start-first-project");
  assert.equal(activationGoals.goals[2].status, "active");
  assert.equal(activationGoals.goals[3].goalType, "reach-first-value");
});

test("activation goals helper exposes missing-inputs when nexus positioning is not ready", () => {
  const { activationGoals } = deriveActivationGoals({
    nexusPositioning: {
      nexusPositioningId: "nexus-positioning:operators",
      status: "missing-inputs",
    },
  });

  assert.equal(activationGoals.status, "missing-inputs");
  assert.deepEqual(activationGoals.missingInputs, ["nexusPositioning"]);
  assert.deepEqual(activationGoals.goals, []);
});
