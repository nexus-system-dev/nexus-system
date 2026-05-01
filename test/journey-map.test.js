import test from "node:test";
import assert from "node:assert/strict";

import { createJourneyMap } from "../src/core/journey-map.js";

test("journey map returns canonical flows and transitions", () => {
  const { journeyMap } = createJourneyMap({
    userJourneys: {
      goals: ["להשיק מוצר"],
      journeys: [
        {
          journeyId: "journey-onboarding-initialization",
          name: "Onboarding And Project Initialization",
          intent: "collect intake",
          entryPoints: ["user-submits-onboarding-intake"],
          initialSystemState: {
            onboardingState: "not-started",
          },
          transitions: [
            {
              transitionId: "onboarding:capture-intake",
              fromState: "onboardingState:not-started",
              toState: "onboardingState:capturing-intake",
            },
            {
              transitionId: "onboarding:handoff-ready",
              fromState: "onboardingState:capturing-intake",
              toState: "onboardingState:ready-for-handoff",
            },
          ],
        },
        {
          journeyId: "journey-execution-state-advancement",
          name: "Execution And State Advancement",
          intent: "manage execution",
          entryPoints: ["system-selects-next-task"],
          initialSystemState: {
            executionState: "idle",
          },
          transitions: [
            {
              transitionId: "execution:review-state",
              fromState: "executionState:state-observed",
              toState: "executionState:task-selected",
              branch: "success",
            },
          ],
        },
      ],
    },
  });

  assert.equal(journeyMap.summary.totalJourneys, 2);
  assert.equal(journeyMap.summary.totalSteps, 3);
  assert.equal(journeyMap.flows[0].flowType, "onboarding-initialization");
  assert.equal(journeyMap.flows[0].transitionMap[0].nextTransitionId, "onboarding:handoff-ready");
  assert.equal(journeyMap.flows[1].transitionMap[0].isTerminal, true);
  assert.equal(journeyMap.summary.entryPoints.includes("user-submits-onboarding-intake"), true);
});

test("journey map does not continue failure or approval branches into unrelated success transitions", () => {
  const { journeyMap } = createJourneyMap({
    userJourneys: {
      goals: ["להשיק מוצר"],
      journeys: [
        {
          journeyId: "journey-onboarding-initialization",
          name: "Onboarding And Project Initialization",
          intent: "collect intake",
          transitions: [
            {
              transitionId: "onboarding:capture-intake",
              fromState: "onboardingState:not-started",
              toState: "onboardingState:capturing-intake",
            },
            {
              transitionId: "onboarding:resolve-gaps",
              fromState: "onboardingState:capturing-intake",
              toState: "onboardingState:needs-input",
              branch: "failure",
            },
            {
              transitionId: "onboarding:handoff-ready",
              fromState: "onboardingState:capturing-intake",
              toState: "onboardingState:ready-for-handoff",
            },
          ],
        },
        {
          journeyId: "journey-execution-state-advancement",
          name: "Execution And State Advancement",
          intent: "manage execution",
          transitions: [
            {
              transitionId: "execution:select-task",
              fromState: "executionState:state-observed",
              toState: "executionState:task-selected",
            },
            {
              transitionId: "execution:await-approval",
              fromState: "executionState:task-selected",
              toState: "executionState:awaiting-approval",
              branch: "approval",
            },
            {
              transitionId: "execution:authorize",
              fromState: "executionState:task-selected",
              toState: "executionState:authorized",
            },
          ],
        },
      ],
    },
  });

  const onboardingFailure = journeyMap.flows[0].transitionMap.find((entry) => entry.transitionId === "onboarding:resolve-gaps");
  const executionApproval = journeyMap.flows[1].transitionMap.find((entry) => entry.transitionId === "execution:await-approval");

  assert.equal(onboardingFailure.nextTransitionId, null);
  assert.equal(onboardingFailure.isTerminal, true);
  assert.equal(executionApproval.nextTransitionId, null);
  assert.equal(executionApproval.isTerminal, true);
});
