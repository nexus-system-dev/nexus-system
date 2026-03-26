import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalTriggerResolver } from "../src/core/approval-trigger-resolver.js";

test("approval trigger resolver requires approval for production deploy", () => {
  const result = createApprovalTriggerResolver({
    actionType: "deploy-release",
    actionPayload: {
      environment: "production",
    },
    policyContext: {
      decisionIntelligence: {
        summary: {
          requiresApproval: true,
        },
        approvalRequired: [{ reason: "Confirm production deploy" }],
      },
    },
  });

  assert.equal(result.requiresApproval, true);
  assert.equal(result.approvalType, "deployment-approval");
  assert.equal(result.approvalReason, "Confirm production deploy");
});

test("approval trigger resolver allows low-risk execution when approval is not required", () => {
  const result = createApprovalTriggerResolver({
    actionType: "scan-project",
    actionPayload: {},
    policyContext: {
      decisionIntelligence: {
        summary: {
          requiresApproval: false,
        },
        approvalRequired: [],
      },
    },
  });

  assert.equal(result.requiresApproval, false);
  assert.equal(result.approvalType, "execution-approval");
  assert.equal(result.approvalReason, null);
});
