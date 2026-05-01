import test from "node:test";
import assert from "node:assert/strict";

import { defineScreenInventory } from "../src/core/screen-inventory.js";

test("screen inventory derives screens from journey map", () => {
  const { screenInventory } = defineScreenInventory({
    journeyMap: {
      goals: ["להשיק מוצר"],
      flows: [
        {
          journeyId: "journey-onboarding-initialization",
          flowType: "onboarding-initialization",
          transitions: [
            {
              transitionId: "onboarding:capture-intake",
              trigger: "user-submits-onboarding-intake",
              actingComponent: "onboarding-service",
              fromState: "onboardingState:not-started",
              toState: "onboardingState:capturing-intake",
              observableOutput: "project intake is recorded",
            },
            {
              transitionId: "onboarding:blocked",
              trigger: "bootstrap-validation-failed",
              actingComponent: "project-service",
              fromState: "onboardingState:bootstrapping",
              toState: "onboardingState:blocked",
              observableOutput: "bootstrap is blocked and requires recovery or more input",
              branch: "failure",
            },
          ],
        },
        {
          journeyId: "journey-execution-state-advancement",
          flowType: "execution-state-advancement",
          transitions: [
            {
              transitionId: "execution:observe-state",
              trigger: "context-refresh",
              actingComponent: "context-builder",
              fromState: "executionState:idle",
              toState: "executionState:state-observed",
              observableOutput: "current bottleneck and next task are exposed",
            },
          ],
        },
      ],
    },
  });

  assert.equal(screenInventory.summary.totalScreens, 3);
  assert.equal(screenInventory.screens[0].screenType, "wizard");
  assert.equal(screenInventory.screens[0].transitionId, "onboarding:capture-intake");
  assert.equal(screenInventory.screens[1].branch, "failure");
  assert.equal(screenInventory.screens[2].screenType, "dashboard");
  assert.equal(screenInventory.summary.flowsCovered.includes("execution-state-advancement"), true);
  assert.equal(screenInventory.summary.branchesCovered.includes("failure"), true);
});

test("screen inventory respects terminal branch semantics from transitionMap instead of array position", () => {
  const { screenInventory } = defineScreenInventory({
    journeyMap: {
      goals: ["להשיק מוצר"],
      flows: [
        {
          journeyId: "journey-onboarding-initialization",
          flowType: "onboarding-initialization",
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
          transitionMap: [
            {
              transitionId: "onboarding:capture-intake",
              nextTransitionId: "onboarding:handoff-ready",
              isTerminal: false,
              branch: "success",
            },
            {
              transitionId: "onboarding:resolve-gaps",
              nextTransitionId: null,
              isTerminal: true,
              branch: "failure",
            },
            {
              transitionId: "onboarding:handoff-ready",
              nextTransitionId: null,
              isTerminal: true,
              branch: "success",
            },
          ],
        },
        {
          journeyId: "journey-approval-explanation-resolution",
          flowType: "approval-explanation-resolution",
          transitions: [
            {
              transitionId: "approval:pending",
              fromState: "approvalState:required",
              toState: "approvalState:pending",
            },
            {
              transitionId: "approval:rejected",
              fromState: "approvalState:pending",
              toState: "approvalState:rejected",
              branch: "failure",
            },
            {
              transitionId: "approval:blocked",
              fromState: "approvalState:rejected",
              toState: "approvalState:blocked",
              branch: "failure",
            },
          ],
          transitionMap: [
            {
              transitionId: "approval:pending",
              nextTransitionId: null,
              isTerminal: false,
              branch: "approval",
            },
            {
              transitionId: "approval:rejected",
              nextTransitionId: "approval:blocked",
              isTerminal: false,
              branch: "failure",
            },
            {
              transitionId: "approval:blocked",
              nextTransitionId: null,
              isTerminal: true,
              branch: "failure",
            },
          ],
        },
      ],
    },
  });

  const onboardingFailure = screenInventory.screens.find((screen) => screen.transitionId === "onboarding:resolve-gaps");
  const onboardingSuccess = screenInventory.screens.find((screen) => screen.transitionId === "onboarding:handoff-ready");
  const approvalRejected = screenInventory.screens.find((screen) => screen.transitionId === "approval:rejected");
  const approvalBlocked = screenInventory.screens.find((screen) => screen.transitionId === "approval:blocked");

  assert.equal(onboardingFailure?.isExitScreen, true);
  assert.equal(onboardingSuccess?.isExitScreen, true);
  assert.equal(approvalRejected?.isExitScreen, false);
  assert.equal(approvalBlocked?.isExitScreen, true);
});
