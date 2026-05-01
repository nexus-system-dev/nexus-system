import test from "node:test";
import assert from "node:assert/strict";
import { createLiveProjectMonitoringModel } from "../src/core/live-project-monitoring-model.js";

test("live project monitoring model emits live monitoring payload", () => {
  const { liveProjectMonitoring } = createLiveProjectMonitoringModel({
    platformTrace: { traceId: "trace-1" },
    releaseStateUpdate: { lifecycle: { phase: "released" } },
    ownerIncident: { ownerIncidentId: "incident-1", incidentState: "active" },
  });

  assert.equal(liveProjectMonitoring.status, "ready");
  assert.equal(liveProjectMonitoring.traceId, "trace-1");
});
