import test from "node:test";
import assert from "node:assert/strict";

import { createRecoveryOrchestrationModule } from "../src/core/recovery-orchestration-module.js";

test("recovery orchestration prefers retry when retry policy is available", () => {
  const { recoveryDecision, recoveryActions } = createRecoveryOrchestrationModule({
    retryPolicy: {
      retryPolicyId: "retry-policy:1",
      shouldRetry: true,
      taskType: "backend",
      maxAttempts: 2,
      strategy: "exponential-backoff",
      retryDelaysMs: [5000, 10000],
      schedulerHint: {
        queue: "retry-queue",
      },
    },
    fallbackStrategy: {
      primaryStrategy: {
        action: "switch-execution-mode",
      },
    },
    rollbackPlan: {
      rollbackMode: "targeted",
    },
  });

  assert.equal(recoveryDecision.decisionType, "retry");
  assert.equal(recoveryDecision.requiresUserDecision, false);
  assert.equal(recoveryActions[0].actionType, "retry");
  assert.equal(recoveryActions[0].metadata.maxAttempts, 2);
});

test("recovery orchestration asks user when fallback requires approval", () => {
  const { recoveryDecision, recoveryActions } = createRecoveryOrchestrationModule({
    retryPolicy: {
      shouldRetry: false,
    },
    fallbackStrategy: {
      fallbackStrategyId: "fallback-strategy:1",
      currentMode: "temp-branch",
      primaryStrategy: {
        strategyId: "fallback-request-approval",
        action: "request-approval",
        reason: "Execution is blocked on approval",
        confidence: "high",
      },
      alternatives: [],
    },
    rollbackPlan: {
      rollbackMode: "none",
    },
  });

  assert.equal(recoveryDecision.decisionType, "ask-user");
  assert.equal(recoveryDecision.requiresUserDecision, true);
  assert.equal(recoveryActions[0].actionType, "request-approval");
  assert.equal(recoveryActions[0].requiresUserInput, true);
});

test("recovery orchestration falls back to rollback when no retry or fallback path exists", () => {
  const { recoveryDecision, recoveryActions } = createRecoveryOrchestrationModule({
    retryPolicy: {
      shouldRetry: false,
    },
    fallbackStrategy: {},
    rollbackPlan: {
      rollbackPlanId: "rollback-plan:1",
      rollbackMode: "targeted",
      requiresConfirmation: true,
      scope: {
        state: [{ targetId: "project-state", targetType: "project-state" }],
      },
      summary: {
        totalTargets: 1,
      },
    },
  });

  assert.equal(recoveryDecision.decisionType, "rollback");
  assert.equal(recoveryDecision.requiresUserDecision, true);
  assert.equal(recoveryActions[0].actionType, "rollback");
  assert.equal(recoveryActions[0].metadata.totalTargets, 1);
});
