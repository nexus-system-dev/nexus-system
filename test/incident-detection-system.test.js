import test from "node:test";
import assert from "node:assert/strict";
import { createIncidentDetectionSystem } from "../src/core/incident-detection-system.js";
test("incident detection system emits owner incident summary", () => {
  const { ownerIncident } = createIncidentDetectionSystem({
    ownerOperationsSignals: { ownerOperationsSignalsId: "signals-1", status: "ready", healthStatus: "active" },
    platformTrace: { traceId: "trace-1" },
  });
  assert.equal(ownerIncident.status, "ready");
  assert.equal(ownerIncident.traceId, "trace-1");
});
