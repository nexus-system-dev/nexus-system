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

test("companion trigger policy shows inline guidance for recommending companion state", () => {
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
      status: "completed",
      mode: "interactive",
    },
  });

  assert.equal(companionTriggerDecision.decisionType, "show");
  assert.equal(companionTriggerDecision.visibility.visible, true);
  assert.equal(companionTriggerDecision.visibility.inline, true);
  assert.equal(companionTriggerDecision.summary.canInterrupt, false);
});

test("companion trigger policy normalizes malformed identifiers and control strings", () => {
  const { companionTriggerDecision } = createCompanionTriggerPolicy({
    companionState: {
      state: "  WARNING  ",
      reasons: ["   Approval still required   "],
    },
    policyTrace: {
      requiresApproval: true,
      finalDecision: "  BLOCKED ",
      reason: "   ",
    },
    executionStatus: {
      projectId: "   ",
      status: "  FAILED ",
      mode: "  INTERACTIVE ",
    },
  });

  assert.equal(companionTriggerDecision.decisionId, "companion-trigger:project");
  assert.equal(companionTriggerDecision.decisionType, "interrupt");
  assert.equal(companionTriggerDecision.visibility.visible, true);
  assert.equal(companionTriggerDecision.visibility.inline, false);
  assert.equal(companionTriggerDecision.visibility.dockBadge, true);
  assert.equal(companionTriggerDecision.reasons[0], "Approval still required");
  assert.equal(companionTriggerDecision.summary.blockedByPolicy, true);
  assert.equal(companionTriggerDecision.summary.executionMode, "interactive");
  assert.equal(companionTriggerDecision.summary.canInterrupt, true);
});
