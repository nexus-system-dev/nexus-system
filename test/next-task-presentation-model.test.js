import test from "node:test";
import assert from "node:assert/strict";

import { createNextTaskPresentationModel } from "../src/core/next-task-presentation-model.js";

test("next task presentation model combines task reason alternatives and approval state", () => {
  const { nextTaskPresentation } = createNextTaskPresentationModel({
    schedulerDecision: {
      source: "scheduler",
      alternatives: ["switch-to-safe-path"],
    },
    nextActionExplanation: {
      reason: "צריך את האישור שלך לפני שאפשר להמשיך בבטחה.",
      alternatives: ["wait-for-approval"],
      userFacingAction: "לפתוח בקשת אישור",
      summary: {
        schedulerSource: "scheduler",
      },
    },
    approvalStatus: {
      status: "pending",
      reason: "Waiting for owner approval",
    },
    selectedTask: {
      id: "approval-handoff:deploy",
      summary: "Deploy production",
      alternatives: ["open-approval-request"],
      successCriteria: ["The owner approves the deployment"],
    },
    selectionReason: {
      code: "approval-gate",
      summary: "Execution is blocked until approval is resolved",
      source: "approval-status",
    },
  });

  assert.equal(nextTaskPresentation.selectedTask.id, "approval-handoff:deploy");
  assert.equal(nextTaskPresentation.reason.code, "approval-gate");
  assert.equal(nextTaskPresentation.approvalState.status, "pending");
  assert.equal(nextTaskPresentation.summary.requiresApproval, true);
  assert.equal(nextTaskPresentation.alternatives.includes("open-approval-request"), true);
});

test("next task presentation model falls back safely without selected task", () => {
  const { nextTaskPresentation } = createNextTaskPresentationModel({
    schedulerDecision: null,
    nextActionExplanation: null,
    approvalStatus: { status: "approved" },
    selectedTask: null,
    selectionReason: null,
  });

  assert.equal(nextTaskPresentation.selectedTask, null);
  assert.equal(nextTaskPresentation.summary.hasTask, false);
  assert.equal(nextTaskPresentation.approvalState.requiresApproval, false);
});
