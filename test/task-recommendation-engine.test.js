import test from "node:test";
import assert from "node:assert/strict";
import { createTaskRecommendationEngine } from "../src/core/task-recommendation-engine.js";
test("task recommendation engine emits owner task list", () => {
  const { ownerTaskList } = createTaskRecommendationEngine({
    ownerFocusArea: { ownerFocusAreaId: "focus-1", status: "ready", area: "growth" },
    ownerActionRecommendations: { status: "ready", recommendations: [{ summary: "Review growth actions" }] },
  });
  assert.equal(ownerTaskList.status, "ready");
  assert.equal(ownerTaskList.tasks.length, 1);
});
