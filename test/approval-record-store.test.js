import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalRecordStore } from "../src/core/approval-record-store.js";

test("approval record store returns canonical approved record with audit trail and expiration", () => {
  const { approvalRecord } = createApprovalRecordStore({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
      projectId: "giftwallet",
      actionType: "deploy",
      actorType: "agent-runtime",
      actionPayload: {
        environment: "staging",
        approvalType: "deployment-approval",
      },
      riskContext: {
        riskLevel: "high",
        reason: "Confirm deploy plan",
        uncertainty: false,
      },
      requestedAt: null,
      status: "pending",
    },
    approvalDecision: {
      decision: "approved",
      approved: true,
      actorId: "demo-user",
      expiresInHours: 12,
    },
  });

  assert.equal(approvalRecord.projectId, "giftwallet");
  assert.equal(approvalRecord.status, "approved");
  assert.equal(approvalRecord.approvalType, "deployment-approval");
  assert.equal(approvalRecord.expiresAt, "in:12h");
  assert.equal(Array.isArray(approvalRecord.auditTrail), true);
  assert.equal(approvalRecord.auditTrail[0].eventType, "approval.requested");
  assert.equal(approvalRecord.auditTrail[1].eventType, "approval.approved");
});

test("approval record store falls back to canonical rejected record", () => {
  const { approvalRecord } = createApprovalRecordStore({
    approvalDecision: "rejected",
  });

  assert.equal(approvalRecord.status, "rejected");
  assert.equal(approvalRecord.actionType, "unspecified-action");
  assert.equal(approvalRecord.reason, null);
  assert.equal(approvalRecord.expiresAt, null);
});
