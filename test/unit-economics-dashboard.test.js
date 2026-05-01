import test from "node:test";
import assert from "node:assert/strict";
import { createUnitEconomicsDashboard } from "../src/core/unit-economics-dashboard.js";
test("unit economics dashboard emits ready dashboard", () => {
  const { unitEconomicsDashboard } = createUnitEconomicsDashboard({
    profitMarginSummary: { profitMarginSummaryId: "margin-1", status: "ready" },
  });
  assert.equal(unitEconomicsDashboard.status, "ready");
});
