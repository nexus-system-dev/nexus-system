import test from "node:test";
import assert from "node:assert/strict";

import { createSharedApprovalFlowModel } from "../src/core/shared-approval-flow-model.js";

test("shared approval flow model coordinates reviewers owners and operators for high risk approvals", () => {
  const { sharedApprovalState } = createSharedApprovalFlowModel({
    approvalRequest: {
      approvalRequestId: "approval:project-1:deploy:agent-runtime",
      actionType: "deploy",
      status: "pending",
      riskContext: {
        riskLevel: "high",
      },
    },
    workspaceModel: {
      workspaceId: "workspace-1",
      visibility: "private",
      roles: ["owner", "editor"],
    },
  });

  assert.equal(sharedApprovalState.approvalRequestId, "approval:project-1:deploy:agent-runtime");
  assert.equal(sharedApprovalState.participants.some((participant) => participant.participantRole === "owner"), true);
  assert.equal(sharedApprovalState.participants.some((participant) => participant.participantRole === "reviewer"), true);
  assert.equal(sharedApprovalState.participants.some((participant) => participant.participantRole === "operator"), true);
  assert.equal(sharedApprovalState.coordinationRules.requiresReviewerDecision, true);
  assert.equal(sharedApprovalState.summary.requiresCoordinatedDecision, true);
});

test("shared approval flow model falls back safely for basic approvals", () => {
  const { sharedApprovalState } = createSharedApprovalFlowModel();

  assert.equal(typeof sharedApprovalState.sharedApprovalStateId, "string");
  assert.equal(Array.isArray(sharedApprovalState.participants), true);
  assert.equal(typeof sharedApprovalState.summary.currentStatus, "string");
});
