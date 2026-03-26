import test from "node:test";
import assert from "node:assert/strict";

import { createBottleneckStateUpdater } from "../src/core/bottleneck-state-updater.js";

test("bottleneck state updater clears bottleneck after successful task result", () => {
  const { updatedBottleneckState } = createBottleneckStateUpdater({
    unblockPlan: {
      unblockPlanId: "unblock-plan:1",
      bottleneckId: "active-bottleneck:approval:1",
      blockerType: "approval-blocker",
      nextActions: [
        {
          actionId: "unblock-approval",
          actionType: "approval",
        },
      ],
      requiresReplan: false,
    },
    taskResult: {
      taskId: "task-1",
      status: "completed",
    },
  });

  assert.equal(updatedBottleneckState.status, "cleared");
  assert.equal(updatedBottleneckState.summary.isBlocked, false);
  assert.equal(updatedBottleneckState.remainingActions.length, 0);
});

test("bottleneck state updater keeps next actions when latest task still failed", () => {
  const { updatedBottleneckState } = createBottleneckStateUpdater({
    unblockPlan: {
      unblockPlanId: "unblock-plan:2",
      bottleneckId: "active-bottleneck:task:2",
      blockerType: "failed-task",
      nextActions: [
        {
          actionId: "unblock-retry-task",
          actionType: "retry-task",
        },
      ],
      requiresReplan: true,
    },
    taskResult: {
      taskId: "task-2",
      status: "failed",
      reason: "Build failed",
    },
  });

  assert.equal(updatedBottleneckState.status, "active");
  assert.equal(updatedBottleneckState.summary.isBlocked, true);
  assert.equal(updatedBottleneckState.summary.requiresReplan, true);
  assert.equal(updatedBottleneckState.remainingActions[0].actionType, "retry-task");
});

test("bottleneck state updater does not clear when the current bottleneck is still actively blocking", () => {
  const { updatedBottleneckState } = createBottleneckStateUpdater({
    unblockPlan: {
      unblockPlanId: "unblock-plan:3",
      bottleneckId: "active-bottleneck:release:3",
      blockerType: "release-blocker",
      nextActions: [
        {
          actionId: "unblock-release",
          actionType: "release-fix",
        },
      ],
      requiresReplan: false,
    },
    taskResult: {
      taskId: "task-3",
      status: "completed",
    },
    activeBottleneck: {
      bottleneckId: "active-bottleneck:release:3",
      blockerType: "release-blocker",
      summary: {
        isBlocking: true,
      },
    },
  });

  assert.equal(updatedBottleneckState.status, "pending-unblock");
  assert.equal(updatedBottleneckState.summary.isBlocked, true);
  assert.equal(updatedBottleneckState.remainingActions[0].actionType, "release-fix");
});
