import test from "node:test";
import assert from "node:assert/strict";
import { createOwnerRoutineAssistant } from "../src/core/owner-routine-assistant.js";
test("owner routine assistant emits checklist", () => {
  const { ownerRoutinePlan } = createOwnerRoutineAssistant({
    ownerTaskList: { ownerTaskListId: "tasks-1", status: "ready" },
    ownerDailyWorkflow: { status: "ready", workflowBlocks: ["review-health"] },
  });
  assert.equal(ownerRoutinePlan.status, "ready");
  assert.equal(ownerRoutinePlan.checklist.includes("end-of-day-closure"), true);
});
