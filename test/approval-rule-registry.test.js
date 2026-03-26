import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalRuleRegistry } from "../src/core/approval-rule-registry.js";

test("approval rule registry returns deployment approval rule", () => {
  const { approvalRule } = createApprovalRuleRegistry({
    actionType: "deploy-release",
    actionPayload: {
      environment: "production",
    },
  });

  assert.equal(approvalRule.id, "deployment-approval");
  assert.equal(approvalRule.approvalClass, "deployment");
  assert.equal(approvalRule.riskLevel, "high");
});

test("approval rule registry falls back to execution approval rule", () => {
  const { approvalRule } = createApprovalRuleRegistry({
    actionType: "scan-project",
    actionPayload: {},
  });

  assert.equal(approvalRule.id, "execution-approval");
  assert.equal(approvalRule.approvalClass, "execution");
});
