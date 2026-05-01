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
        requiresApproval: true,
      },
      reasons: ["Approval is still required."],
    },
    progressState: {
      status: "waiting",
    },
  });

  assert.equal(interruptionDecision.decision, "guarded");
  assert.equal(interruptionDecision.allowed, false);
  assert.equal(interruptionDecision.summary.blockedByApprovalSensitivity, true);
});

test("companion interruption guard suppresses quiet trigger decisions", () => {
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision: {
      decisionId: "trigger-3",
      decisionType: "stay-quiet",
      summary: {
        executionMode: "interactive",
        requiresApproval: false,
      },
      reasons: ["The companion should remain quiet."],
    },
    progressState: {
      status: "idle",
    },
  });

  assert.equal(interruptionDecision.decision, "suppress");
  assert.equal(interruptionDecision.allowed, false);
  assert.equal(interruptionDecision.summary.blockedByQuietMode, true);
  assert.equal(interruptionDecision.summary.canInterrupt, false);
});

test("companion interruption guard allows canonical warning interruptions", () => {
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision: {
      decisionId: "trigger-4",
      decisionType: "interrupt",
      summary: {
        executionMode: "interactive",
        requiresApproval: false,
      },
      reasons: ["A warning condition needs attention."],
    },
    progressState: {
      status: "waiting",
    },
  });

  assert.equal(interruptionDecision.decision, "allow");
  assert.equal(interruptionDecision.allowed, true);
  assert.equal(interruptionDecision.summary.blockedByCriticalExecution, false);
  assert.equal(interruptionDecision.summary.canInterrupt, true);
});

test("companion interruption guard normalizes malformed identifiers and control strings", () => {
  const { interruptionDecision } = createCompanionInterruptionGuard({
    companionTriggerDecision: {
      decisionId: "  ",
      decisionType: " interrupt ",
      summary: {
        executionMode: " INTERACTIVE ",
        requiresApproval: false,
      },
      reasons: ["   "],
    },
    progressState: {
      status: " waiting ",
    },
  });

  assert.equal(interruptionDecision.decisionId, "companion-interruption:project");
  assert.equal(interruptionDecision.decision, "allow");
  assert.equal(interruptionDecision.allowed, true);
  assert.deepEqual(interruptionDecision.reasons, [
    "The companion may interrupt with actionable guidance.",
  ]);
  assert.equal(interruptionDecision.summary.blockedByCriticalExecution, false);
  assert.equal(interruptionDecision.summary.blockedByQuietMode, false);
  assert.equal(interruptionDecision.summary.canInterrupt, true);
});
