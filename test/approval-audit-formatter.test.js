import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalAuditFormatter } from "../src/core/approval-audit-formatter.js";

test("approval audit formatter returns flattened audit trail entries", () => {
  const { approvalAuditTrail } = createApprovalAuditFormatter({
    approvalRecords: [
      {
        approvalRecordId: "approval-record:giftwallet:deploy:agent-runtime",
        approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
        actionType: "deploy",
        status: "approved",
        auditTrail: [
          {
            eventType: "approval.requested",
            status: "pending",
            actorId: "agent-runtime",
            reason: "Confirm deploy",
          },
          {
            eventType: "approval.approved",
            status: "approved",
            actorId: "demo-user",
            reason: "Approved",
          },
        ],
      },
    ],
  });

  assert.equal(Array.isArray(approvalAuditTrail.entries), true);
  assert.equal(approvalAuditTrail.totalRecords, 1);
  assert.equal(approvalAuditTrail.totalEntries, 2);
  assert.equal(approvalAuditTrail.entries[0].eventType, "approval.requested");
  assert.equal(approvalAuditTrail.entries[1].eventType, "approval.approved");
});

test("approval audit formatter falls back to empty trail", () => {
  const { approvalAuditTrail } = createApprovalAuditFormatter();

  assert.equal(approvalAuditTrail.totalRecords, 0);
  assert.equal(approvalAuditTrail.totalEntries, 0);
  assert.equal(approvalAuditTrail.latestStatus, null);
});
