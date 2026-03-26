import test from "node:test";
import assert from "node:assert/strict";

import { createPolicyTraceBuilder } from "../src/core/policy-trace-builder.js";

test("policy trace builder returns canonical trace for allowed action", () => {
  const { policyTrace } = createPolicyTraceBuilder({
    policyDecision: {
      actionType: "deploy",
      actorType: "user",
      decision: "allowed",
      reason: "Action deploy is allowed for user",
      matchedPolicies: ["deploy-guardrails"],
      requiresApproval: false,
    },
    enforcementResult: {
      decision: "allowed",
      reason: "Execution enforcement resolved without explicit reason",
      blockingSources: [],
      requiresApproval: false,
    },
  });

  assert.equal(policyTrace.finalDecision, "allowed");
  assert.equal(policyTrace.traceSteps.length, 2);
  assert.equal(policyTrace.traceSteps[0].step, "policy-decision");
  assert.deepEqual(policyTrace.blockingSources, []);
});

test("policy trace builder propagates enforcement block and approval need", () => {
  const { policyTrace } = createPolicyTraceBuilder({
    policyDecision: {
      actionType: "deploy",
      actorType: "system",
      decision: "requires-approval",
      reason: "Action deploy requires approval",
      matchedPolicies: ["approval-gating"],
      requiresApproval: true,
    },
    enforcementResult: {
      decision: "blocked",
      reason: "Deploy policy blocked this deployment",
      blockingSources: ["deploy"],
      requiresApproval: true,
    },
  });

  assert.equal(policyTrace.finalDecision, "blocked");
  assert.equal(policyTrace.requiresApproval, true);
  assert.equal(policyTrace.blockingSources.includes("deploy"), true);
});
