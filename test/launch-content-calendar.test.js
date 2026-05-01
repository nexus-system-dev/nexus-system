import test from "node:test";
import assert from "node:assert/strict";
import { createLaunchContentCalendar } from "../src/core/launch-content-calendar.js";

test("launch content calendar builds a three-phase calendar", () => {
  const { launchContentCalendar } = createLaunchContentCalendar({
    nexusContentStrategy: { nexusContentStrategyId: "strategy-1", status: "ready" },
    businessContext: { gtmStage: "beta" },
  });
  assert.equal(launchContentCalendar.status, "ready");
  assert.equal(launchContentCalendar.entries.length, 3);
});
