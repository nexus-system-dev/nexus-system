import test from "node:test";
import assert from "node:assert/strict";

import { createPolicyEnforcementGuard } from "../src/core/policy-enforcement-guard.js";

test("policy enforcement guard allows execution when all policy layers allow it", () => {
  const { enforcementResult } = createPolicyEnforcementGuard({
    policyDecision: {
      decision: "allowed",
      reason: "Execution policy allows this action",
    },
    approvalStatus: {
      status: "approved",
    },
    deployPolicyDecision: {
      decision: "allowed",
    },
    credentialPolicyDecision: {
      decision: "allowed",
    },
  });

  assert.equal(enforcementResult.decision, "allowed");
  assert.equal(enforcementResult.isAllowed, true);
  assert.deepEqual(enforcementResult.blockingSources, []);
});

test("policy enforcement guard requires approval when approval is still missing", () => {
  const { enforcementResult } = createPolicyEnforcementGuard({
    policyDecision: {
      decision: "requires-approval",
      reason: "Execution policy requires approval",
    },
    approvalStatus: {
      status: "missing",
      reason: "Approval record is missing",
    },
    deployPolicyDecision: {
      decision: "requires-approval",
    },
    credentialPolicyDecision: {
      decision: "allowed",
    },
  });

  assert.equal(enforcementResult.decision, "requires-approval");
  assert.equal(enforcementResult.requiresApproval, true);
});

test("policy enforcement guard blocks execution when one policy layer blocks", () => {
  const { enforcementResult } = createPolicyEnforcementGuard({
    policyDecision: {
      decision: "allowed",
      reason: "Execution policy allows this action",
    },
    approvalStatus: {
      status: "approved",
    },
    deployPolicyDecision: {
      decision: "blocked",
      reason: "Deploy policy blocked this deployment",
    },
    credentialPolicyDecision: {
      decision: "blocked",
      reason: "Credential usage is blocked by policy",
    },
  });

  assert.equal(enforcementResult.decision, "blocked");
  assert.equal(enforcementResult.isBlocked, true);
  assert.equal(enforcementResult.blockingSources.includes("deploy"), true);
  assert.equal(enforcementResult.blockingSources.includes("credential"), true);
});
