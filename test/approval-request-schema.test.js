import test from "node:test";
import assert from "node:assert/strict";

import { defineApprovalRequestSchema } from "../src/core/approval-request-schema.js";

test("approval request schema returns canonical approval request", () => {
  const { approvalRequest } = defineApprovalRequestSchema({
    actionType: "deploy",
    projectId: "giftwallet",
    actorType: "agent-runtime",
    actionPayload: {
      environment: "production",
    },
    riskContext: {
      riskLevel: "high",
    },
    decisionIntelligence: {
      summary: {
        requiresApproval: true,
        hasUncertainty: true,
      },
      approvalRequired: [{ reason: "Confirm production deploy" }],
    },
  });

  assert.equal(approvalRequest.projectId, "giftwallet");
  assert.equal(approvalRequest.actionType, "deploy");
  assert.equal(approvalRequest.actorType, "agent-runtime");
  assert.equal(approvalRequest.status, "pending");
  assert.equal(approvalRequest.riskContext.riskLevel, "high");
  assert.equal(approvalRequest.riskContext.reason, "Confirm production deploy");
});

test("approval request schema falls back to defaults", () => {
  const { approvalRequest } = defineApprovalRequestSchema();

  assert.equal(approvalRequest.actionType, "unspecified-action");
  assert.equal(approvalRequest.actorType, "system");
});
