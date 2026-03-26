import test from "node:test";
import assert from "node:assert/strict";

import { defineFailureRecoverySchema } from "../src/core/failure-recovery-schema.js";

test("failure recovery schema returns retry and rollback paths for execution failures", () => {
  const { failureRecoveryModel } = defineFailureRecoverySchema({
    executionResult: {
      status: "failed",
      taskId: "task-1",
      reason: "command execution failed",
    },
    failureSummary: {
      status: "blocked",
      primaryReason: "build artifact missing",
      categories: ["artifact"],
    },
  });

  assert.equal(failureRecoveryModel.failureClass, "artifact-failure");
  assert.equal(failureRecoveryModel.retryability, "retryable");
  assert.equal(Array.isArray(failureRecoveryModel.fallbackOptions), true);
  assert.equal(failureRecoveryModel.rollbackScope.scope, "workspace");
  assert.equal(failureRecoveryModel.summary.canRetry, true);
});

test("failure recovery schema returns manual intervention for approval failures", () => {
  const { failureRecoveryModel } = defineFailureRecoverySchema({
    executionResult: {
      status: "blocked",
      taskId: "task-2",
    },
    failureSummary: {
      status: "blocked",
      primaryReason: "approval pending",
      categories: ["approval"],
    },
  });

  assert.equal(failureRecoveryModel.failureClass, "approval-blocked");
  assert.equal(failureRecoveryModel.retryability, "manual-only");
  assert.equal(failureRecoveryModel.summary.requiresIntervention, true);
  assert.equal(failureRecoveryModel.userRecoveryPrompts.length > 0, true);
});
