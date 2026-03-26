import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalExplanationBuilder } from "../src/core/approval-explanation-builder.js";

test("approval explanation builder explains why approval is needed and rejection impact", () => {
  const { approvalExplanation } = createApprovalExplanationBuilder({
    approvalRequest: {
      approvalRequestId: "approval:project-1:deploy:agent-runtime",
      status: "pending",
      riskContext: {
        riskLevel: "high",
        reason: "Production deploy needs confirmation",
      },
    },
    policyTrace: {
      finalDecision: "requires-approval",
      reason: "Production deploy is gated by policy",
      requiresApproval: true,
    },
    activeBottleneck: {
      blockerType: "approval-blocker",
      reason: "Approval is missing",
    },
  });

  assert.equal(approvalExplanation.riskLevel, "high");
  assert.equal(approvalExplanation.whyApproval, "השינוי הזה דורש אישור לפני שנמשיך");
  assert.equal(
    approvalExplanation.whatIfRejected,
    "בלי אישור, הפרויקט יישאר תקוע בשלב הזה או יעבור למסלול חלופי.",
  );
});

test("approval explanation builder falls back safely with partial inputs", () => {
  const { approvalExplanation } = createApprovalExplanationBuilder({
    policyTrace: {
      finalDecision: "blocked",
    },
  });

  assert.equal(approvalExplanation.summary.finalDecision, "blocked");
  assert.equal(typeof approvalExplanation.whatIfRejected, "string");
});

test("approval explanation builder does not keep requiring approval after approval is already granted", () => {
  const { approvalExplanation } = createApprovalExplanationBuilder({
    approvalRequest: {
      approvalRequestId: "approval:project-1:deploy:agent-runtime",
      status: "approved",
      riskContext: {
        riskLevel: "high",
        reason: "Production deploy needed confirmation",
      },
    },
    approvalStatus: {
      status: "approved",
      isApproved: true,
      isRejected: false,
    },
    policyTrace: {
      finalDecision: "allowed",
      reason: "Action deploy is allowed for agent-runtime",
      requiresApproval: false,
    },
    activeBottleneck: {
      blockerType: "release-blocker",
      reason: "Release validation failed",
    },
  });

  assert.equal(approvalExplanation.summary.requiresApproval, false);
  assert.equal(approvalExplanation.summary.blockerType, "release-blocker");
  assert.equal(approvalExplanation.summary.finalDecision, "allowed");
});
