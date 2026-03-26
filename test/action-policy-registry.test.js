import test from "node:test";
import assert from "node:assert/strict";

import { createActionPolicyRegistry } from "../src/core/action-policy-registry.js";

test("action policy registry returns matching execution policy", () => {
  const { actionPolicy } = createActionPolicyRegistry({
    actionType: "sandbox-execution",
    policySchema: {
      execution: {
        policies: [
          {
            id: "execution-controlled-modes",
            kind: "execution",
            allowedActions: ["sandbox", "temp-branch"],
            decision: "allow",
          },
        ],
      },
      approvals: { policies: [] },
      credentials: { policies: [] },
      deploy: { policies: [] },
    },
  });

  assert.equal(actionPolicy.id, "execution-controlled-modes");
  assert.equal(actionPolicy.kind, "execution");
  assert.equal(actionPolicy.decision, "allow");
  assert.equal(actionPolicy.matchedPolicies.length, 1);
});

test("action policy registry falls back to default execution policy", () => {
  const { actionPolicy } = createActionPolicyRegistry({
    actionType: "unknown-action",
  });

  assert.equal(actionPolicy.id, "default-execution-policy");
  assert.equal(actionPolicy.actionType, "unknown-action");
  assert.equal(actionPolicy.kind, "execution");
});
