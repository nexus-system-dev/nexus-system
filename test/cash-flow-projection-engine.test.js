import test from "node:test";
import assert from "node:assert/strict";
import { createCashFlowProjectionEngine } from "../src/core/cash-flow-projection-engine.js";
test("cash flow projection engine emits ready projection", () => {
  const { cashFlowProjection } = createCashFlowProjectionEngine({
    ownerRevenueView: { ownerRevenueViewId: "revenue-1", status: "ready" },
    ownerCostView: { status: "ready" },
  });
  assert.equal(cashFlowProjection.status, "ready");
});
