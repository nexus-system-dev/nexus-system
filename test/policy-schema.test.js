import test from "node:test";
import assert from "node:assert/strict";

import { definePolicySchema } from "../src/core/policy-schema.js";

test("policy schema returns canonical grouped policy payload", () => {
  const { policySchema } = definePolicySchema({
    policyDefinitions: [
      {
        id: "execution-controlled-modes",
        kind: "execution",
        allowedActions: ["sandbox", "temp-branch"],
      },
      {
        id: "approval-gating",
        kind: "approval",
        approvalTypes: ["deployment-approval"],
      },
      {
        id: "credential-protection",
        kind: "credential",
        protectedFlows: ["deploy"],
      },
      {
        id: "deploy-guardrails",
        kind: "deploy",
        guardedTargets: ["web-deployment"],
      },
    ],
  });

  assert.equal(policySchema.version, "1.0.0");
  assert.equal(policySchema.summary.totalPolicies, 4);
  assert.equal(policySchema.execution.allowedActions.includes("sandbox"), true);
  assert.equal(policySchema.approvals.approvalTypes.includes("deployment-approval"), true);
  assert.equal(policySchema.credentials.protectedFlows.includes("deploy"), true);
  assert.equal(policySchema.deploy.guardedTargets.includes("web-deployment"), true);
});

test("policy schema falls back to empty canonical payload", () => {
  const { policySchema } = definePolicySchema();

  assert.equal(policySchema.summary.totalPolicies, 0);
  assert.equal(Array.isArray(policySchema.execution.policies), true);
  assert.equal(Array.isArray(policySchema.approvals.policies), true);
  assert.equal(Array.isArray(policySchema.credentials.policies), true);
  assert.equal(Array.isArray(policySchema.deploy.policies), true);
});
