import test from "node:test";
import assert from "node:assert/strict";

import { createMaintenanceTaskGenerationEngine } from "../src/core/maintenance-task-generation-engine.js";

test("maintenance task generation engine emits canonical maintenance backlog", () => {
  const { maintenanceBacklog } = createMaintenanceTaskGenerationEngine({
    liveProjectMonitoring: {
      liveProjectMonitoringId: "monitoring-1",
      status: "ready",
      healthStatus: "degraded",
    },
    incidentTimeline: {
      incidentTimelineId: "timeline-1",
      status: "ready",
    },
    rootCauseSummary: {
      rootCauseSummaryId: "root-cause-1",
      suspectedCause: "queue-saturation",
    },
    ownerIncident: {
      ownerIncidentId: "incident-1",
      status: "ready",
      incidentState: "active",
    },
  });

  assert.equal(maintenanceBacklog.status, "ready");
  assert.equal(maintenanceBacklog.items.length, 2);
  assert.equal(maintenanceBacklog.items[0].maintenanceTaskId.includes("stabilize"), true);
  assert.deepEqual(maintenanceBacklog.items[1].dependencies, [maintenanceBacklog.items[0].maintenanceTaskId]);
  assert.deepEqual(maintenanceBacklog.items[0].requiredCapabilities, ["devops"]);
  assert.equal(maintenanceBacklog.items[0].priority > maintenanceBacklog.items[1].priority, true);
});

test("maintenance task generation engine does not spam backlog in healthy state", () => {
  const { maintenanceBacklog } = createMaintenanceTaskGenerationEngine({
    liveProjectMonitoring: {
      liveProjectMonitoringId: "monitoring-healthy",
      status: "ready",
      healthStatus: "stable",
      alerts: [],
    },
    incidentTimeline: {
      incidentTimelineId: "timeline-healthy",
      status: "ready",
    },
    rootCauseSummary: {
      rootCauseSummaryId: "root-cause-healthy",
      status: "ready",
    },
    ownerIncident: {
      ownerIncidentId: "incident-healthy",
      status: "ready",
      incidentState: "monitoring",
    },
  });

  assert.equal(maintenanceBacklog.status, "not-required");
  assert.deepEqual(maintenanceBacklog.items, []);
  assert.equal(maintenanceBacklog.triggerState, "inactive");
});
