import test from "node:test";
import assert from "node:assert/strict";

import { createApprovalGatingModule } from "../src/core/approval-gating-module.js";

test("approval gating module allows execution when approval is approved", () => {
  const { gatingDecision } = createApprovalGatingModule({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
    },
    approvalStatus: {
      status: "approved",
      reason: null,
    },
  });

  assert.equal(gatingDecision.decision, "allowed");
  assert.equal(gatingDecision.isBlocked, false);
  assert.equal(gatingDecision.requiresApproval, false);
});

test("approval gating module blocks execution when approval is rejected", () => {
  const { gatingDecision } = createApprovalGatingModule({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
    },
    approvalStatus: {
      status: "rejected",
      reason: "Rejected by user",
    },
  });

  assert.equal(gatingDecision.decision, "blocked");
  assert.equal(gatingDecision.isBlocked, true);
  assert.equal(gatingDecision.requiresApproval, false);
});

test("approval gating module requires approval when approval is missing", () => {
  const { gatingDecision } = createApprovalGatingModule({
    approvalRequest: {
      approvalRequestId: "approval:giftwallet:deploy:agent-runtime",
    },
    approvalStatus: {
      status: "missing",
      reason: "Approval record is missing",
    },
  });

  assert.equal(gatingDecision.decision, "requires-approval");
  assert.equal(gatingDecision.isBlocked, true);
  assert.equal(gatingDecision.requiresApproval, true);
});
