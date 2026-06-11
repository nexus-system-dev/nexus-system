import test from "node:test";
import assert from "node:assert/strict";

import {
  buildApprovedProductDirectionPatch,
  buildBuildApprovalFlow,
  decideBuildApprovalFlow,
} from "../src/core/build-approval-flow.js";

test("BUILD-APPROVAL-001 — pending product direction approval is backed by mutation truth", () => {
  const flow = buildBuildApprovalFlow({
    project: { id: "approval-unit" },
    mutationChangeDecision: {
      taskId: "MUT-001",
      status: "pending-approval",
      mutationDecisionId: "mutation-1",
      requiresApproval: true,
      userRequest: "תשנה את זה להזמנות במקום לידים",
    },
  });

  assert.equal(flow.taskId, "BUILD-APPROVAL-001");
  assert.equal(flow.ownerTaskId, "MUT-001");
  assert.equal(flow.status, "pending-approval");
  assert.equal(flow.decisionStatus, "pending");
  assert.equal(flow.backedByMutationTruth, true);
  assert.equal(flow.currentTruthUnchanged, true);
  assert.equal(flow.targetDirection.label, "ניהול הזמנות");
  assert.equal(flow.allowedDecisions.includes("approve"), true);
  assert.match(flow.impactSummary.rejectionImpact, /נשארים/u);
});

test("BUILD-APPROVAL-001 — approval creates a product direction patch and rejection preserves current truth", () => {
  const pending = buildBuildApprovalFlow({
    project: { id: "approval-decision" },
    mutationChangeDecision: {
      taskId: "MUT-001",
      status: "pending-approval",
      mutationDecisionId: "mutation-2",
      requiresApproval: true,
      userRequest: "תשנה את זה להזמנות במקום לידים",
    },
  });
  const approved = decideBuildApprovalFlow({ approvalFlow: pending, action: "approve" });
  const rejected = decideBuildApprovalFlow({ approvalFlow: pending, action: "reject" });

  assert.equal(approved.status, "approved-applied");
  assert.equal(approved.decisionStatus, "approved");
  assert.equal(approved.currentTruthUnchanged, false);
  assert.equal(buildApprovedProductDirectionPatch({ approvalFlow: approved }).label, "ניהול הזמנות");
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.decisionStatus, "rejected");
  assert.equal(rejected.currentTruthUnchanged, true);
  assert.equal(buildApprovedProductDirectionPatch({ approvalFlow: rejected }), null);
});
