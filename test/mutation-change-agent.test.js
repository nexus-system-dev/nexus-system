import test from "node:test";
import assert from "node:assert/strict";

import {
  appendMutationChangeHistory,
  createMutationChangeAgentDecision,
  finalizeMutationChangeAgentDecision,
} from "../src/core/mutation-change-agent.js";

const project = {
  id: "mutation-agent-project",
  runtimeSkeletonTruth: { runtimeSkeletonId: "runtime-1" },
  productDomainSkeleton: { productDomainSkeletonId: "domain-1" },
  productOwnedBackendSkeleton: { productOwnedBackendSkeletonId: "backend-1" },
};

test("MUT-001 — safe record change can apply automatically with product-truth mutation", () => {
  const decision = createMutationChangeAgentDecision({
    project,
    message: "תוסיף שדה מקור ליד",
    buildAgentTurn: {
      decisionId: "turn-1",
      owner: "mutation-change-agent",
      intent: "small-safe-change",
      requiresApproval: false,
    },
    downstreamAction: {
      shouldApply: true,
      operationId: "record.addField",
      payload: { fieldName: "מקור ליד" },
    },
    now: "2026-06-08T10:00:00.000Z",
  });

  assert.equal(decision.taskId, "MUT-001");
  assert.equal(decision.agentId, "mutation-change-agent");
  assert.equal(decision.changeType, "small");
  assert.equal(decision.requiresApproval, false);
  assert.equal(decision.requiresProductTruthMutation, true);
  assert.equal(decision.mayApplyAutomatically, true);
  assert.equal(decision.status, "ready-to-apply");
  assert.equal(decision.affectedAreas.dataObjects.includes("רשומה"), true);
  assert.equal(decision.historyRecord.approvalStatus, "not-required");
});

test("MUT-001 — product direction change requires approval and does not apply silently", () => {
  const decision = createMutationChangeAgentDecision({
    project,
    message: "תשנה את זה להזמנות במקום לידים",
    buildAgentTurn: {
      decisionId: "turn-2",
      owner: "mutation-change-agent",
      intent: "product-truth-change",
      requiresApproval: true,
    },
    downstreamAction: {
      shouldApply: false,
      status: "approval-or-boundary-required",
    },
    now: "2026-06-08T10:00:00.000Z",
  });

  assert.equal(decision.changeType, "product-truth");
  assert.equal(decision.requiresApproval, true);
  assert.equal(decision.requiresCheckpoint, true);
  assert.equal(decision.status, "pending-approval");
  assert.equal(decision.historyRecord.approvalStatus, "pending");
  assert.match(decision.userReply, /לא משנה את המוצר בשקט/u);
});

test("MUT-001 — finalized decision records applied downstream mutation", () => {
  const decision = createMutationChangeAgentDecision({
    project,
    message: "תוסיף ליד חדש",
    buildAgentTurn: {
      decisionId: "turn-3",
      owner: "mutation-change-agent",
      intent: "small-safe-change",
      requiresApproval: false,
    },
    downstreamAction: {
      shouldApply: true,
      operationId: "record.create",
    },
    now: "2026-06-08T10:00:00.000Z",
  });

  const finalized = finalizeMutationChangeAgentDecision({
    decision,
    downstreamResult: {
      status: "applied",
      mutationId: "build-mutation-1",
      operationId: "record.create",
      visibleSummary: "נוסף ליד זמני לשלד.",
    },
    now: "2026-06-08T10:01:00.000Z",
  });

  assert.equal(finalized.status, "applied");
  assert.equal(finalized.appliedMutationId, "build-mutation-1");
  assert.equal(finalized.historyRecord.after, "נוסף ליד זמני לשלד.");
  assert.equal(finalized.historyRecord.truthStatus, "new-truth");
});

test("HIST-AGT-001 — mutation history snapshot keeps product model name from lead truth", () => {
  const history = appendMutationChangeHistory({
    ...project,
    name: "ניהול לידים",
    goal: "כלי פנימי לניהול לידים עם סטטוס ואחראי",
    runtimeSkeletonTruth: {
      runtimeSkeletonId: "runtime-leads",
      title: "ניהול לידים",
    },
    productDomainSkeleton: {
      domainSkeletonId: "domain-leads",
      models: [{ name: "Record" }],
    },
  }, {
    taskId: "MUT-001",
    mutationDecisionId: "mutation-leads",
    projectId: "mutation-agent-project",
    changeType: "product-truth",
    status: "pending-approval",
    requiresApproval: true,
    requiresCheckpoint: true,
    historyRecord: {
      after: "לא בוצע שינוי עד אישור המשתמש.",
    },
  });

  assert.equal(history[0].productSnapshot.productDomainSkeleton.models[0].name, "ליד");
  assert.match(history[0].productSnapshot.runtimeSkeletonTruth.title, /לידים/u);
});
