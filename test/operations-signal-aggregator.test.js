import test from "node:test";
import assert from "node:assert/strict";
import { createOperationsSignalAggregator } from "../src/core/operations-signal-aggregator.js";
test("operations signal aggregator emits ready owner operations signals", () => {
  const { ownerOperationsSignals } = createOperationsSignalAggregator({
    platformTrace: { traceId: "trace-1" },
    healthStatus: "stable",
    budgetDecision: { status: "within-budget" },
    incidentAlert: { status: "monitoring" },
  });
  assert.equal(ownerOperationsSignals.status, "ready");
});
