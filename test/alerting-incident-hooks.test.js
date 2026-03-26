import test from "node:test";
import assert from "node:assert/strict";

import { createAlertingAndIncidentHooks } from "../src/core/alerting-incident-hooks.js";

test("alerting and incident hooks create active alert for degraded runtime and connector outage", () => {
  const { incidentAlert } = createAlertingAndIncidentHooks({
    platformTrace: {
      traceId: "trace-1",
      steps: [
        {
          source: "github-connector",
          status: "failed",
          message: "GitHub connector timeout",
        },
      ],
      logs: [
        {
          message: "queue stall detected on nexus-background",
        },
      ],
    },
    healthStatus: {
      status: "degraded",
      dependencyStatus: [
        { name: "api-runtime", status: "down" },
      ],
    },
  });

  assert.equal(incidentAlert.status, "active");
  assert.equal(incidentAlert.incidentCount >= 2, true);
  assert.equal(incidentAlert.affectedComponents.includes("api-runtime"), true);
  assert.equal(incidentAlert.recommendedHooks.includes("in-app"), true);
  assert.equal(
    incidentAlert.incidents.some((incident) => incident.type === "connector-outage" || incident.type === "queue-stall"),
    true,
  );
});

test("alerting and incident hooks stay clear when no incident signal exists", () => {
  const { incidentAlert } = createAlertingAndIncidentHooks({
    platformTrace: {
      traceId: "trace-2",
      steps: [{ source: "runtime", status: "completed", message: "done" }],
      logs: [{ message: "all good" }],
    },
    healthStatus: {
      status: "healthy",
      isReady: true,
      dependencyStatus: [{ name: "api-runtime", status: "healthy", readiness: "ready" }],
    },
  });

  assert.equal(incidentAlert.status, "clear");
  assert.equal(incidentAlert.incidentCount, 0);
  assert.deepEqual(incidentAlert.recommendedHooks, []);
});
