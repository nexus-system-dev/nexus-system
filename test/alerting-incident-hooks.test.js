import test from "node:test";
import assert from "node:assert/strict";

import { createAlertingAndIncidentHooks } from "../src/core/alerting-incident-hooks.js";
import { createPlatformObservabilityTransport } from "../src/core/platform-observability-transport.js";

test("alerting and incident hooks create active alert for degraded runtime and connector outage", () => {
  const observabilityTransport = createPlatformObservabilityTransport();
  const { incidentAlert, incidentNotificationEvent, incidentEmailDeliveryResult, incidentExternalDeliveryResult } = createAlertingAndIncidentHooks({
    platformTrace: {
      traceId: "trace-1",
      route: "/runtime/bootstrap",
      method: "SYSTEM",
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
    projectId: "giftwallet",
    actorId: "user-1",
    userEmail: "alerts@example.com",
    deliveryPreferences: {
      email: "alerts@example.com",
      emailEnabled: true,
    },
    channelConfig: {
      provider: "ops-webhook",
      webhookUrl: "https://alerts.example.com/hook",
    },
    observabilityTransport,
  });

  assert.equal(incidentAlert.status, "active");
  assert.equal(incidentAlert.incidentCount >= 2, true);
  assert.equal(incidentAlert.affectedComponents.includes("api-runtime"), true);
  assert.equal(incidentAlert.recommendedHooks.includes("in-app"), true);
  assert.equal(typeof incidentNotificationEvent.notificationEventId, "string");
  assert.equal(incidentEmailDeliveryResult.deliveryStatus, "queued");
  assert.equal(incidentExternalDeliveryResult.deliveryStatus, "queued");
  assert.equal(incidentAlert.hookDispatches.length, 3);
  assert.equal(observabilityTransport.getSnapshot().summary.totalTraces, 1);
  assert.equal(
    incidentAlert.incidents.some((incident) => incident.type === "connector-outage" || incident.type === "queue-stall"),
    true,
  );
});

test("alerting and incident hooks stay clear when no incident signal exists", () => {
  const { incidentAlert, incidentNotificationEvent } = createAlertingAndIncidentHooks({
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
  assert.equal(incidentNotificationEvent, null);
  assert.deepEqual(incidentAlert.hookDispatches, []);
});
