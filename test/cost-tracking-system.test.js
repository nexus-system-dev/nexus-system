import test from "node:test";
import assert from "node:assert/strict";
import { createCostTrackingSystem } from "../src/core/cost-tracking-system.js";
test("cost tracking system exposes ready cost view", () => {
  const { ownerCostView } = createCostTrackingSystem({
    costSummary: { costSummaryId: "cost-1", status: "ready" },
    budgetDecision: { status: "within-budget" },
  });
  assert.equal(ownerCostView.status, "ready");
});
