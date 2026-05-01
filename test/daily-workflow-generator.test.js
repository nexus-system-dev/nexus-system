import test from "node:test";
import assert from "node:assert/strict";
import { createDailyWorkflowGenerator } from "../src/core/daily-workflow-generator.js";
test("daily workflow generator emits workflow blocks", () => {
  const { ownerDailyWorkflow } = createDailyWorkflowGenerator({
    dailyOwnerOverview: { dailyOwnerOverviewId: "overview-1", status: "ready" },
    ownerPriorityQueue: { status: "ready", priorities: [{ area: "growth" }] },
  });
  assert.equal(ownerDailyWorkflow.status, "ready");
  assert.equal(ownerDailyWorkflow.workflowBlocks.length, 4);
});
