import test from "node:test";
import assert from "node:assert/strict";

import { createAgentGovernanceTrace } from "../src/core/agent-governance-trace.js";

function createInputs() {
  return {
    agentGovernancePolicy: {
      agentType: "dev-agent",
      sandboxLevel: "controlled-write",
    },
    sandboxDecision: {
      taskType: "backend",
      decision: "allowed",
    },
    agentLimitDecision: {
      decision: "requires-escalation",
      taskType: "backend",
      scopeType: "project",
      scopeId: "giftwallet",
      hardBlockChecks: [
        {
          checkId: "hard-block:sandbox-escalation",
          checkType: "sandbox-decision",
          status: "requires-escalation",
          reason: "Sandbox decision requires escalation.",
          action: "request-approval",
        },
      ],
      limitChecks: [
        {
          checkId: "limit:max-write-targets",
          checkType: "max-write-targets",
          status: "requires-escalation",
          reason: "Write targets exceed maxWriteTargets.",
          observedValue: 8,
          limitValue: 6,
          action: "reduce-write-targets",
        },
      ],
      costChecks: [
        {
          checkId: "cost:per-action-limit",
          checkType: "per-action-limit",
          status: "pass",
          reason: "Estimated cost stays within perActionLimit.",
          observedValue: 3,
          limitValue: 5,
          action: "request-approval",
        },
      ],
      providerSideEffectChecks: [
        {
          checkId: "provider-side-effect:deploy",
          operationType: "deploy",
          status: "requires-escalation",
          reason: "Provider side effect deploy requires approval under privileged action policy.",
          requiredAction: "request-approval",
        },
      ],
      escalationHint: {
        reason: "Sandbox decision requires escalation.",
        requiredAction: "request-approval",
      },
    },
  };
}

test("agent governance trace derives allChecks and summary from sections", () => {
  const { agentGovernanceTrace } = createAgentGovernanceTrace(createInputs());

  assert.equal(agentGovernanceTrace.finalDecision, "requires-escalation");
  assert.equal(agentGovernanceTrace.allChecks.length, 4);
  assert.equal(agentGovernanceTrace.summary.totalChecks, 4);
  assert.equal(agentGovernanceTrace.summary.escalatedCount, 3);
  assert.equal(agentGovernanceTrace.summary.passedCount, 1);
  assert.equal(agentGovernanceTrace.summary.requiresEscalation, true);
});

test("agent governance trace mirrors finalDecision exactly from agentLimitDecision", () => {
  const inputs = createInputs();
  inputs.agentLimitDecision.decision = "blocked";

  const { agentGovernanceTrace } = createAgentGovernanceTrace(inputs);

  assert.equal(agentGovernanceTrace.finalDecision, "blocked");
  assert.equal(agentGovernanceTrace.summary.isBlocked, true);
});

test("every trace check contains canonical required fields and source", () => {
  const { agentGovernanceTrace } = createAgentGovernanceTrace(createInputs());

  for (const check of agentGovernanceTrace.allChecks) {
    assert.equal(typeof check.checkId, "string");
    assert.equal(typeof check.status, "string");
    assert.equal(["limit", "cost", "provider", "hard-block"].includes(check.source), true);
    assert.equal(Object.hasOwn(check, "observedValue"), true);
    assert.equal(Object.hasOwn(check, "limitValue"), true);
  }
});
