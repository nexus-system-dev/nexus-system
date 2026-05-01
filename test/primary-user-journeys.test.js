import test from "node:test";
import assert from "node:assert/strict";

import { definePrimaryUserJourneys } from "../src/core/primary-user-journeys.js";

test("primary user journeys returns the locked system journey set and canonical registries", () => {
  const { userJourneys, journeySteps, journeyStateRegistry, journeyTransitionRegistry } = definePrimaryUserJourneys({
    productGoals: ["להשיק את Nexus"],
    coreCapabilities: [{ label: "auth" }, { label: "release" }, { label: "recovery" }],
    businessContext: {
      targetAudience: "product teams",
      gtmStage: "build",
    },
  });

  assert.equal(userJourneys.goals[0], "להשיק את Nexus");
  assert.equal(userJourneys.capabilities.includes("auth"), true);
  assert.equal(userJourneys.targetAudience, "product teams");
  assert.equal(userJourneys.summary.totalJourneys, 5);
  assert.deepEqual(
    userJourneys.journeys.map((journey) => journey.journeyId),
    [
      "journey-onboarding-initialization",
      "journey-execution-state-advancement",
      "journey-approval-explanation-resolution",
      "journey-failure-recovery-continuity",
      "journey-continuous-operation-reentry",
    ],
  );
  assert.equal(journeyStateRegistry.stateModelType, "hybrid");
  assert.equal(journeyStateRegistry.sourceOfTruth.currentState, "project.state.journeyState");
  assert.equal(Array.isArray(journeyTransitionRegistry), true);
  assert.equal(journeyTransitionRegistry.some((transition) => transition.transitionId === "execution:await-approval"), true);
  assert.equal(Array.isArray(journeySteps), true);
  assert.equal(journeySteps.some((step) => step.journeyId === "journey-execution-state-advancement"), true);
  assert.equal(userJourneys.journeys[2].branches.approvalPath.includes("pending"), true);
  assert.equal(userJourneys.journeys[3].stateMappings.includes("recoveryState"), true);
});

test("primary user journeys accepts boolean capability maps and promotes enabled keys", () => {
  const { userJourneys } = definePrimaryUserJourneys({
    productGoals: "Ship Nexus",
    coreCapabilities: {
      auth: true,
      release: true,
      billing: false,
    },
  });

  assert.deepEqual(userJourneys.capabilities, ["auth", "release"]);
});

test("primary user journeys ignores non-string array capability payloads and keeps explicit labels", () => {
  const { userJourneys } = definePrimaryUserJourneys({
    productGoals: ["Ship Nexus"],
    coreCapabilities: [
      { value: true },
      { label: "auth", value: true },
      { value: "release" },
      { label: "   " },
    ],
  });

  assert.deepEqual(userJourneys.capabilities, ["auth", "release"]);
});
