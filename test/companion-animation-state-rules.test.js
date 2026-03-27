import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionAnimationStateRules } from "../src/core/companion-animation-state-rules.js";

test("companion animation state rules use noticeable motion for warning interruptions", () => {
  const { animationStateRules } = createCompanionAnimationStateRules({
    companionState: {
      stateId: "companion-state:1",
      state: "warning",
    },
    companionTriggerDecision: {
      decisionType: "interrupt",
      summary: {
        canInterrupt: true,
      },
    },
  });

  assert.equal(animationStateRules.animationMode, "pulse");
  assert.equal(animationStateRules.motionLevel, "noticeable");
  assert.equal(animationStateRules.summary.nonBlocking, true);
});

test("companion animation state rules stay still in quiet mode", () => {
  const { animationStateRules } = createCompanionAnimationStateRules({
    companionState: {
      stateId: "companion-state:2",
      state: "observing",
    },
    companionTriggerDecision: {
      decisionType: "stay-quiet",
      summary: {
        canInterrupt: false,
      },
    },
  });

  assert.equal(animationStateRules.animationMode, "still");
  assert.equal(animationStateRules.motionLevel, "minimal");
  assert.equal(animationStateRules.loop, false);
});
