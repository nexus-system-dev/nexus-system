import test from "node:test";
import assert from "node:assert/strict";

import { createScreenToFlowMapping } from "../src/core/screen-flow-map.js";

test("screen-to-flow mapping returns trigger and next action for each screen", () => {
  const { screenFlowMap } = createScreenToFlowMapping({
    screenInventory: {
      screens: [
        {
          screenId: "journey-onboarding-initialization:onboarding:capture-intake",
          screenType: "wizard",
          journeyId: "journey-onboarding-initialization",
          flowType: "onboarding-initialization",
          stepId: "onboarding:capture-intake",
          transitionId: "onboarding:capture-intake",
          trigger: "user-submits-onboarding-intake",
          branch: "success",
        },
        {
          screenId: "journey-execution-state-advancement:execution:await-approval",
          screenType: "workspace",
          journeyId: "journey-execution-state-advancement",
          flowType: "execution-state-advancement",
          stepId: "execution:await-approval",
          transitionId: "execution:await-approval",
          branch: "approval",
        },
        {
          screenId: "journey-approval-explanation-resolution:approval:rejected",
          screenType: "detail",
          journeyId: "journey-approval-explanation-resolution",
          flowType: "approval-explanation-resolution",
          stepId: "approval:rejected",
          transitionId: "approval:rejected",
          branch: "failure",
        },
        {
          screenId: "journey-failure-recovery-continuity:recovery:execute",
          screenType: "tracking",
          journeyId: "journey-failure-recovery-continuity",
          flowType: "failure-recovery-continuity",
          stepId: "recovery:execute",
          transitionId: "recovery:execute",
          isExitScreen: true,
        },
      ],
    },
    journeyMap: {
      flows: [
        {
          journeyId: "journey-onboarding-initialization",
          transitionMap: [
            {
              transitionId: "onboarding:capture-intake",
              nextTransitionId: "onboarding:resolve-gaps",
              branch: "success",
              isTerminal: false,
              trigger: "user-submits-onboarding-intake",
            },
          ],
        },
        {
          journeyId: "journey-execution-state-advancement",
          transitions: [
            {
              transitionId: "execution:await-approval",
              trigger: "approval-gate-triggered",
              actingComponent: "approval-trigger-resolver",
              fromState: "executionState:task-selected",
              toState: "executionState:awaiting-approval",
              branch: "approval",
            },
          ],
          transitionMap: [
            {
              transitionId: "execution:await-approval",
              nextTransitionId: null,
              branch: "approval",
              isTerminal: true,
            },
          ],
        },
        {
          journeyId: "journey-approval-explanation-resolution",
          transitions: [
            {
              transitionId: "approval:rejected",
              trigger: "approval-status-rejected",
              actingComponent: "approval-status-resolver",
              fromState: "approvalState:pending",
              toState: "approvalState:rejected",
              branch: "failure",
            },
            {
              transitionId: "approval:blocked",
              trigger: "project-service-persists-rejection",
              actingComponent: "project-service",
              fromState: "approvalState:rejected",
              toState: "approvalState:blocked",
              branch: "failure",
            },
          ],
          transitionMap: [
            {
              transitionId: "approval:rejected",
              nextTransitionId: "approval:blocked",
              branch: "failure",
              isTerminal: false,
            },
            {
              transitionId: "approval:blocked",
              nextTransitionId: null,
              branch: "failure",
              isTerminal: true,
            },
          ],
        },
        {
          journeyId: "journey-failure-recovery-continuity",
          transitionMap: [
            {
              transitionId: "recovery:execute",
              nextTransitionId: null,
              branch: "success",
              isTerminal: true,
            },
          ],
        },
      ],
    },
  });

  assert.equal(screenFlowMap.summary.totalMappings, 4);
  assert.equal(screenFlowMap.mappings[0].trigger, "user-submits-onboarding-intake");
  assert.equal(screenFlowMap.mappings[0].nextAction, "go-to:onboarding:resolve-gaps");
  assert.equal(screenFlowMap.mappings[1].trigger, "approval-gate-triggered");
  assert.equal(screenFlowMap.mappings[1].nextAction, "request-approval-decision");
  assert.equal(screenFlowMap.mappings[1].actingComponent, "approval-trigger-resolver");
  assert.equal(screenFlowMap.mappings[1].fromState, "executionState:task-selected");
  assert.equal(screenFlowMap.mappings[2].nextAction, "go-to:approval:blocked");
  assert.equal(screenFlowMap.mappings[2].isTerminal, false);
  assert.equal(screenFlowMap.mappings[2].trigger, "approval-status-rejected");
  assert.equal(screenFlowMap.mappings[3].nextAction, "review-recovery-status");
  assert.equal(screenFlowMap.mappings[3].isTerminal, true);
});
