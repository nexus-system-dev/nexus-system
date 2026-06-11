import test from "node:test";
import assert from "node:assert/strict";

import { buildCanonicalMutationFlowShell } from "../src/core/canonical-mutation-flow-shell.js";

test("EXP-002 — safe applied mutation renders a completed canonical flow", () => {
  const flow = buildCanonicalMutationFlowShell({
    project: { id: "flow-safe" },
    mutationChangeDecision: {
      taskId: "MUT-001",
      status: "applied",
      changeType: "small",
      requiresApproval: false,
      requiresProductTruthMutation: true,
      mayApplyAutomatically: true,
      mutationDecisionId: "mutation-decision-1",
      appliedMutationId: "build-mutation-1",
      historyRecord: { after: "נוסף שדה מקור ליד." },
    },
    mutationChangeHistory: [{ historyRecordId: "mutation-history-1" }],
    buildMutationTruth: { status: "applied", lastMutationId: "build-mutation-1" },
    buildMutationHistory: [{ historyRecordId: "build-history-1" }],
  });

  assert.equal(flow.taskId, "EXP-002");
  assert.equal(flow.ownerTaskId, "MUT-001");
  assert.equal(flow.status, "applied");
  assert.equal(flow.requiresApproval, false);
  assert.equal(flow.requiresProductTruthMutation, true);
  assert.equal(flow.historyCount, 1);
  assert.equal(flow.buildMutationHistoryCount, 1);
  assert.equal(flow.steps.find((step) => step.stepId === "apply").status, "done");
  assert.equal(flow.steps.find((step) => step.stepId === "history").status, "done");
});

test("EXP-002 — product direction mutation stays blocked at approval step", () => {
  const flow = buildCanonicalMutationFlowShell({
    project: { id: "flow-approval" },
    mutationChangeDecision: {
      taskId: "MUT-001",
      status: "pending-approval",
      changeType: "product-truth",
      requiresApproval: true,
      requiresProductTruthMutation: true,
      mayApplyAutomatically: false,
      historyRecord: { after: "לא בוצע שינוי עד אישור המשתמש." },
    },
    mutationChangeHistory: [{ historyRecordId: "mutation-history-1" }],
    buildMutationTruth: { status: "applied", lastMutationId: "previous-build-mutation" },
    buildMutationHistory: [{ historyRecordId: "previous-build-history" }],
  });

  assert.equal(flow.status, "pending-approval");
  assert.equal(flow.requiresApproval, true);
  assert.equal(flow.buildMutationHistoryCount, 1);
  assert.equal(flow.steps.find((step) => step.stepId === "approval").status, "waiting");
  assert.equal(flow.steps.find((step) => step.stepId === "apply").status, "blocked");
  assert.match(flow.userFacingSummary, /ממתין לאישור|ממתין/u);
});
