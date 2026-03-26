import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionCompletionNotifier } from "../src/core/execution-completion-notifier.js";

test("execution completion notifier returns success payload", () => {
  const { notificationPayload } = createExecutionCompletionNotifier({
    executionResult: {
      taskId: "task-1",
      status: "completed",
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: false,
      },
    },
  });

  assert.equal(notificationPayload.type, "success");
  assert.equal(notificationPayload.nextAction, "continue");
});

test("execution completion notifier returns intervention payload when user action is required", () => {
  const { notificationPayload } = createExecutionCompletionNotifier({
    executionResult: {
      taskId: "task-2",
      status: "failed",
      reason: "Approval required",
      requiresUserAction: true,
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: true,
      },
    },
  });

  assert.equal(notificationPayload.type, "failure");
  assert.equal(notificationPayload.requiresApproval, true);
});
