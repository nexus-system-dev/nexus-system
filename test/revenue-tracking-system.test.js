import test from "node:test";
import assert from "node:assert/strict";
import { createRevenueTrackingSystem } from "../src/core/revenue-tracking-system.js";
test("revenue tracking system exposes ready revenue view", () => {
  const { ownerRevenueView } = createRevenueTrackingSystem({
    revenueSummary: { revenueSummaryId: "revenue-1", status: "ready" },
    subscriptionState: { status: "active" },
  });
  assert.equal(ownerRevenueView.status, "ready");
});
