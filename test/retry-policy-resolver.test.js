import test from "node:test";
import assert from "node:assert/strict";

import { createRetryPolicyResolver } from "../src/core/retry-policy-resolver.js";

test("retry policy resolver returns exponential backoff policy for retryable backend failures", () => {
  const { retryPolicy } = createRetryPolicyResolver({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-1",
      retryability: "retryable",
    },
    taskType: "backend",
  });

  assert.equal(retryPolicy.shouldRetry, true);
  assert.equal(retryPolicy.maxAttempts, 2);
  assert.equal(retryPolicy.strategy, "exponential-backoff");
  assert.deepEqual(retryPolicy.retryDelaysMs, [5000, 10000]);
  assert.equal(retryPolicy.summary.requiresScheduler, true);
});

test("retry policy resolver blocks retries for manual-only failures", () => {
  const { retryPolicy } = createRetryPolicyResolver({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-2",
      retryability: "manual-only",
    },
    taskType: "release",
  });

  assert.equal(retryPolicy.shouldRetry, false);
  assert.equal(retryPolicy.maxAttempts, 0);
  assert.equal(retryPolicy.strategy, "no-retry");
  assert.equal(retryPolicy.summary.requiresUserDecision, true);
});
