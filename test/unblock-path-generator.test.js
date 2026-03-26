import test from "node:test";
import assert from "node:assert/strict";

import { createUnblockPathGenerator } from "../src/core/unblock-path-generator.js";

test("unblock path generator returns approval path and replan action when needed", () => {
  const { unblockPlan } = createUnblockPathGenerator({
    scoredBottleneck: {
      scoredBottleneckId: "scored-bottleneck:1",
      bottleneckId: "active-bottleneck:approval:1",
      blockerType: "approval-blocker",
      summary: {
        priorityBand: "critical",
      },
    },
    replanTrigger: {
      shouldReplan: true,
    },
  });

  assert.equal(unblockPlan.blockerType, "approval-blocker");
  assert.equal(unblockPlan.requiresReplan, true);
  assert.equal(unblockPlan.nextActions.length, 2);
  assert.equal(unblockPlan.summary.requiresUserAction, true);
});

test("unblock path generator falls back to failed task action without replan", () => {
  const { unblockPlan } = createUnblockPathGenerator({
    scoredBottleneck: {
      scoredBottleneckId: "scored-bottleneck:2",
      bottleneckId: "active-bottleneck:task:2",
      blockerType: "failed-task",
      summary: {
        priorityBand: "high",
      },
    },
  });

  assert.equal(unblockPlan.requiresReplan, false);
  assert.equal(unblockPlan.nextActions[0].actionType, "retry-task");
  assert.equal(unblockPlan.summary.actionCount, 1);
});
