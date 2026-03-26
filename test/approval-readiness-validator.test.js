import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalReadinessValidator } from "../src/core/approval-readiness-validator.js";

test("approval readiness validator passes when required approvals exist", () => {
  const { approvalValidation } = createApprovalReadinessValidator({
    releaseRequirements: {
      requiredApprovals: ["deployment-approval", "stack-approval"],
    },
    projectState: {
      approvals: ["deployment-approval", "stack-approval"],
      decisionIntelligence: {
        approvalRequired: [],
      },
    },
  });

  assert.equal(approvalValidation.isReady, true);
  assert.deepEqual(approvalValidation.missingApprovals, []);
});

test("approval readiness validator reports missing approvals", () => {
  const { approvalValidation } = createApprovalReadinessValidator({
    releaseRequirements: {
      requiredApprovals: ["deployment-approval", "compliance-approval"],
    },
    projectState: {
      approvals: ["deployment-approval"],
      decisionIntelligence: {
        approvalRequired: [],
      },
    },
  });

  assert.equal(approvalValidation.isReady, false);
  assert.equal(approvalValidation.missingApprovals.includes("compliance-approval"), true);
});
