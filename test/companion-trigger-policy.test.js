import test from "node:test";
import assert from "node:assert/strict";

import { createCompanionTriggerPolicy } from "../src/core/companion-trigger-policy.js";

test("companion trigger policy interrupts when warning state requires approval", () => {
  const { companionTriggerDecision } = createCompanionTriggerPolicy({
    companionState: {
      state: "warning",
      reasons: ["Approval is required before continuing."],
    },
    policyTrace: {
      requiresApproval: true,
      finalDecision: "blocked",
      reason: "Execution requires approval.",
    },
    executionStatus: {
      projectId: "nexus",
      status: "failed",
      mode: "interactive",
    },
  });

  assert.equal(companionTriggerDecision.decisionType, "interrupt");
  assert.equal(companionTriggerDecision.visibility.visible, true);
  assert.equal(companionTriggerDecision.summary.canInterrupt, true);
});

test("companion trigger policy stays quiet during critical execution", () => {
  const { companionTriggerDecision } = createCompanionTriggerPolicy({
    companionState: {
      state: "recommending",
      reasons: ["A useful recommendation is available."],
    },
    policyTrace: {
      requiresApproval: false,
      finalDecision: "allowed",
    },
    executionStatus: {
      projectId: "nexus",
      status: "running-critical",
      mode: "critical-run",
    },
  });

  assert.equal(companionTriggerDecision.decisionType, "stay-quiet");
  assert.equal(companionTriggerDecision.visibility.visible, false);
  assert.equal(companionTriggerDecision.summary.executionMode, "critical-run");
});
