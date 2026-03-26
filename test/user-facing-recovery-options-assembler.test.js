import test from "node:test";
import assert from "node:assert/strict";

import { createUserFacingRecoveryOptionsAssembler } from "../src/core/user-facing-recovery-options-assembler.js";

test("user-facing recovery options assembler returns readable payload", () => {
  const { recoveryOptionsPayload } = createUserFacingRecoveryOptionsAssembler({
    failureRecoveryModel: {
      recoveryId: "failure-recovery:1",
      failureClass: "execution-failure",
      retryability: "retryable",
      userRecoveryPrompts: ["לנסות שוב?", "לעבור למסלול בטוח יותר?"],
    },
    recoveryDecision: {
      decisionId: "recovery-decision:1",
      decisionType: "retry",
      reason: "Failure is retryable and retry policy is available",
      requiresUserDecision: false,
    },
    recoveryActions: [
      {
        actionId: "recovery-retry",
        actionType: "retry",
        mode: "retry-queue",
        requiresUserInput: false,
      },
    ],
    rollbackPlan: {
      rollbackMode: "targeted",
      scope: {
        files: [{ targetId: "artifact-1" }],
        state: [{ targetId: "project-state" }],
      },
      summary: {
        totalTargets: 2,
        hasExternalEffects: false,
      },
    },
  });

  assert.equal(recoveryOptionsPayload.headline, "ננסה שוב באופן מבוקר");
  assert.equal(recoveryOptionsPayload.brokenState.failureClass, "execution-failure");
  assert.equal(recoveryOptionsPayload.attemptedRecovery.actions[0].actionType, "retry");
  assert.equal(recoveryOptionsPayload.rollbackStatus.totalTargets, 2);
  assert.equal(recoveryOptionsPayload.summary.optionCount, 3);
});

test("user-facing recovery options assembler falls back to user-decision payload", () => {
  const { recoveryOptionsPayload } = createUserFacingRecoveryOptionsAssembler();

  assert.equal(recoveryOptionsPayload.headline, "נדרשת החלטה שלך");
  assert.equal(recoveryOptionsPayload.summary.optionCount, 0);
  assert.equal(recoveryOptionsPayload.summary.requiresUserDecision, false);
});
