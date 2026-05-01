import test from "node:test";
import assert from "node:assert/strict";
import { createIncidentTimelineTracker } from "../src/core/incident-timeline-tracker.js";

test("incident timeline tracker emits ready timeline", () => {
  const { incidentTimeline } = createIncidentTimelineTracker({
    ownerIncident: { ownerIncidentId: "incident-1", status: "ready", incidentState: "active" },
    platformTrace: { traceId: "trace-1" },
  });

  assert.equal(incidentTimeline.status, "ready");
  assert.equal(incidentTimeline.entries[0].traceId, "trace-1");
});
