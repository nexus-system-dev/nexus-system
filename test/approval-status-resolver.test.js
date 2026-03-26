import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalStatusResolver } from "../src/core/approval-status-resolver.js";

test("approval status resolver returns approved when matching record is approved", () => {
  const { approvalStatus } = createApprovalStatusResolver({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
      projectId: "giftwallet",
      actionType: "deploy",
      actorType: "agent-runtime",
    },
    approvalRecords: [
      {
        approvalRecordId: "approval-record:giftwallet:deploy:agent-runtime",
        approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
        projectId: "giftwallet",
        actionType: "deploy",
        actorType: "agent-runtime",
        decision: "approved",
        status: "approved",
        reason: null,
      },
    ],
  });

  assert.equal(approvalStatus.status, "approved");
  assert.equal(approvalStatus.isApproved, true);
  assert.equal(approvalStatus.isRejected, false);
});

test("approval status resolver returns rejected when record is rejected", () => {
  const { approvalStatus } = createApprovalStatusResolver({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
      projectId: "giftwallet",
      actionType: "deploy",
      actorType: "agent-runtime",
    },
    approvalRecords: [
      {
        approvalRecordId: "approval-record:giftwallet:deploy:agent-runtime",
        approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
        projectId: "giftwallet",
        actionType: "deploy",
        actorType: "agent-runtime",
        decision: "rejected",
        status: "rejected",
        reason: "User rejected production deploy",
      },
    ],
  });

  assert.equal(approvalStatus.status, "rejected");
  assert.equal(approvalStatus.isRejected, true);
  assert.equal(approvalStatus.reason, "User rejected production deploy");
});

test("approval status resolver returns expired when record is expired", () => {
  const { approvalStatus } = createApprovalStatusResolver({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
      projectId: "giftwallet",
      actionType: "deploy",
      actorType: "agent-runtime",
    },
    approvalRecords: [
      {
        approvalRecordId: "approval-record:giftwallet:deploy:agent-runtime",
        approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
        projectId: "giftwallet",
        actionType: "deploy",
        actorType: "agent-runtime",
        decision: "approved",
        status: "approved",
        expiresAt: "expired:2025-01-01T00:00:00.000Z",
      },
    ],
  });

  assert.equal(approvalStatus.status, "expired");
  assert.equal(approvalStatus.isExpired, true);
});

test("approval status resolver returns missing when no record matches", () => {
  const { approvalStatus } = createApprovalStatusResolver({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
      projectId: "giftwallet",
      actionType: "deploy",
      actorType: "agent-runtime",
    },
    approvalRecords: [],
  });

  assert.equal(approvalStatus.status, "missing");
  assert.equal(approvalStatus.isApproved, false);
  assert.equal(approvalStatus.approvalRecordId, null);
});
