import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalExplanationAcceptanceTest } from "../src/core/approval-explanation-acceptance-test.js";

test("approval-and-explanation acceptance test passes when approval gating is enforced and explained", () => {
  const { acceptanceResult } = createApprovalExplanationAcceptanceTest({
    acceptanceScenario: {
      scenarios: [
        {
          scenarioKey: "approval-explanation",
          expectedOutcome: "Approval gating is enforced with clear explanation",
          requiredOutputs: ["approvalExplanation", "projectExplanation"],
        },
      ],
    },
    approvalStatus: {
      approvalRequestId: "approval-123",
      status: "missing",
    },
    approvalExplanation: {
      summary: "Deploy is blocked until approval arrives",
      whatIfRejected: "Deployment remains blocked",
    },
    projectExplanation: {
      approval: {
        summary: "This action needs approval before execution can continue",
      },
    },
  });

  assert.equal(acceptanceResult.scenarioKey, "approval-explanation");
  assert.equal(acceptanceResult.status, "passed");
  assert.equal(acceptanceResult.checks.scenarioResolved, true);
  assert.equal(acceptanceResult.checks.approvalGated, true);
  assert.equal(acceptanceResult.checks.hasApprovalExplanation, true);
  assert.equal(acceptanceResult.checks.hasProjectExplanation, true);
});

test("approval-and-explanation acceptance test fails safely when gating evidence is missing", () => {
  const { acceptanceResult } = createApprovalExplanationAcceptanceTest({
    acceptanceScenario: { scenarios: [] },
    approvalStatus: { status: "approved" },
    approvalExplanation: {},
    projectExplanation: {},
  });

  assert.equal(acceptanceResult.status, "failed");
  assert.equal(acceptanceResult.checks.scenarioResolved, false);
  assert.equal(acceptanceResult.checks.approvalGated, false);
  assert.equal(acceptanceResult.checks.hasApprovalExplanation, false);
  assert.equal(acceptanceResult.checks.hasProjectExplanation, false);
});
