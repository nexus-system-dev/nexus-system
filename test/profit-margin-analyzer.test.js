import test from "node:test";
import assert from "node:assert/strict";
import { createProfitMarginAnalyzer } from "../src/core/profit-margin-analyzer.js";
test("profit margin analyzer emits ready summary", () => {
  const { profitMarginSummary } = createProfitMarginAnalyzer({
    ownerRevenueView: { ownerRevenueViewId: "revenue-1", status: "ready" },
    ownerCostView: { status: "ready" },
  });
  assert.equal(profitMarginSummary.status, "ready");
});
