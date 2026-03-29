import test from "node:test";
import assert from "node:assert/strict";

import { createNextTaskSelectionResolver } from "../src/core/next-task-selection-resolver.js";

test("next task selection resolver picks the first ready task", () => {
  const { selectedTask, selectionReason } = createNextTaskSelectionResolver({
    roadmap: [
      { id: "task-1", summary: "Blocked", status: "blocked" },
      { id: "task-2", summary: "Ready", status: "ready" },
      { id: "task-3", summary: "Assigned", status: "assigned" },
    ],
    blockers: [],
    approvalStatus: { status: "approved" },
  });

  assert.equal(selectedTask.id, "task-2");
  assert.equal(selectionReason.code, "ready-task");
});

test("next task selection resolver returns approval handoff when approval blocks execution", () => {
  const { selectedTask, selectionReason } = createNextTaskSelectionResolver({
    roadmap: [
      { id: "task-1", summary: "Deploy production", status: "blocked", dependencies: ["approval"] },
    ],
    blockers: [
      { blockerId: "approval-1", type: "approval", title: "approval required" },
    ],
    approvalStatus: { status: "pending", reason: "Waiting for owner approval" },
    schedulerAlternatives: ["wait-for-approval", "switch-to-safe-path"],
  });

  assert.equal(selectedTask.assigneeType, "user");
  assert.equal(selectedTask.status, "pending");
  assert.deepEqual(selectedTask.alternatives, ["wait-for-approval", "switch-to-safe-path"]);
  assert.equal(selectionReason.code, "approval-gate");
});
