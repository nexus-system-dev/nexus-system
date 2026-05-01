import test from "node:test";
import assert from "node:assert/strict";
import { createCriticalAlertPrioritizer } from "../src/core/critical-alert-prioritizer.js";
test("critical alert prioritizer emits prioritized alerts", () => {
  const { prioritizedOwnerAlerts } = createCriticalAlertPrioritizer({
    ownerOperationsSignals: { ownerOperationsSignalsId: "signals-1", status: "ready" },
    ownerPriorityQueue: { status: "ready", priorities: [{ urgency: "high", area: "reliability" }] },
  });
  assert.equal(prioritizedOwnerAlerts.status, "ready");
  assert.equal(prioritizedOwnerAlerts.alerts[0].priority, "high");
});
