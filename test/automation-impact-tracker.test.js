import test from "node:test";
import assert from "node:assert/strict";
import { createAutomationImpactTracker } from "../src/core/automation-impact-tracker.js";
test("automation impact tracker emits ready automation impact summary", () => {
  const { automationImpactSummary } = createAutomationImpactTracker({
    taskThroughputSummary: { taskThroughputSummaryId: "throughput-1", status: "ready" },
    productivitySummary: { status: "ready" },
    ownerRoutinePlan: { status: "ready" },
  });
  assert.equal(automationImpactSummary.status, "ready");
});
