import test from "node:test";
import assert from "node:assert/strict";

import { createExecutionPolicyEvaluator } from "../src/core/execution-policy-evaluator.js";

test("execution policy evaluator allows action when policy permits it", () => {
  const { policyDecision } = createExecutionPolicyEvaluator({
    actionType: "sandbox-execution",
    actorType: "agent-runtime",
    actionPayload: {},
    projectState: {
      policySchema: {
        execution: {
          policies: [
            {
              id: "execution-controlled-modes",
              kind: "execution",
              allowedActions: ["sandbox"],
              decision: "allow",
            },
          ],
        },
        approvals: { policies: [] },
        credentials: { policies: [] },
        deploy: { policies: [] },
      },
      gatingDecision: {
        decision: "allowed",
        requiresApproval: false,
      },
    },
  });

  assert.equal(policyDecision.decision, "allowed");
  assert.equal(policyDecision.isAllowed, true);
  assert.equal(policyDecision.policyId, "execution-controlled-modes");
});

test("execution policy evaluator requires approval for production deploy", () => {
  const { policyDecision } = createExecutionPolicyEvaluator({
    actionType: "deploy-release",
    actorType: "agent-runtime",
    actionPayload: {
      environment: "production",
    },
    projectState: {
      policySchema: {
        execution: { policies: [] },
        approvals: { policies: [] },
        credentials: { policies: [] },
        deploy: { policies: [] },
      },
      gatingDecision: {
        decision: "requires-approval",
        requiresApproval: true,
        reason: "Valid approval is required before execution",
      },
    },
  });

  assert.equal(policyDecision.decision, "requires-approval");
  assert.equal(policyDecision.requiresApproval, true);
});

test("execution policy evaluator blocks action when gate is blocked", () => {
  const { policyDecision } = createExecutionPolicyEvaluator({
    actionType: "deploy-release",
    actorType: "agent-runtime",
    actionPayload: {},
    projectState: {
      policySchema: {
        execution: { policies: [] },
        approvals: { policies: [] },
        credentials: { policies: [] },
        deploy: { policies: [] },
      },
      gatingDecision: {
        decision: "blocked",
        requiresApproval: false,
        reason: "Approval was rejected",
      },
    },
  });

  assert.equal(policyDecision.decision, "blocked");
  assert.equal(policyDecision.isBlocked, true);
  assert.equal(policyDecision.reason, "Approval was rejected");
});
