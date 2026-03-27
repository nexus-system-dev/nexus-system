import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionInterruptionGuard } from "../src/core/companion-interruption-guard.js";

test("companion interruption guard suppresses interruptions during critical execution", () => {
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision: {
      decisionId: "trigger-1",
      decisionType: "interrupt",
      summary: {
        executionMode: "critical-run",
      },
      reasons: ["The companion wants to interrupt."],
    },
    gatingDecision: {
      decision: "allowed",
      requiresApproval: false,
    },
    progressState: {
      status: "running-critical",
    },
  });

  assert.equal(interruptionDecision.decision, "suppress");
  assert.equal(interruptionDecision.allowed, false);
  assert.equal(interruptionDecision.summary.blockedByCriticalExecution, true);
});

test("companion interruption guard keeps approval-sensitive flows guarded", () => {
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision: {
      decisionId: "trigger-2",
      decisionType: "interrupt",
      summary: {
        executionMode: "interactive",
      },
      reasons: ["Approval is still required."],
    },
    gatingDecision: {
      decision: "requires-approval",
      requiresApproval: true,
      reason: "Approval is still pending.",
    },
    progressState: {
      status: "waiting",
    },
  });

  assert.equal(interruptionDecision.decision, "guarded");
  assert.equal(interruptionDecision.allowed, false);
  assert.equal(interruptionDecision.summary.blockedByApprovalSensitivity, true);
});
