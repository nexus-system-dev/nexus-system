import test from "node:test";
import assert from "node:assert/strict";

import { createFallbackStrategyResolver } from "../src/core/fallback-strategy-resolver.js";

test("fallback strategy resolver requests approval for approval-blocked failures", () => {
  const { fallbackStrategy } = createFallbackStrategyResolver({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-1",
      failureClass: "approval-blocked",
      fallbackOptions: ["request-approval", "downgrade-scope"],
    },
    executionModeDecision: {
      selectedMode: "temp-branch",
    },
  });

  assert.equal(fallbackStrategy.primaryStrategy.action, "request-approval");
  assert.equal(fallbackStrategy.summary.requiresUserApproval, true);
  assert.equal(fallbackStrategy.summary.strategyCount >= 1, true);
});

test("fallback strategy resolver moves local failures back to cloud workspace", () => {
  const { fallbackStrategy } = createFallbackStrategyResolver({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:task-2",
      failureClass: "execution-failure",
      fallbackOptions: ["switch-to-cloud-workspace"],
    },
    executionModeDecision: {
      selectedMode: "local-terminal",
    },
  });

  assert.equal(fallbackStrategy.primaryStrategy.targetMode, "sandbox");
  assert.equal(fallbackStrategy.primaryStrategy.action, "switch-execution-mode");
  assert.equal(fallbackStrategy.summary.hasModeSwitch, true);
});
