import test from "node:test";
import assert from "node:assert/strict";

import { createPlatformLoggingAndTracingLayer } from "../src/core/platform-logging-tracing-layer.js";
import { createPlatformObservabilityTransport } from "../src/core/platform-observability-transport.js";

test("platform logging and tracing layer returns canonical trace and logs", () => {
  const { platformTrace, platformLogs } = createPlatformLoggingAndTracingLayer({
    runtimeEvents: {
      runId: "run-1",
      status: "running",
      progressEntries: [
        {
          id: "progress-1",
          source: "worker",
          status: "running",
          message: "Bootstrap started",
        },
      ],
      formattedLogs: [
        {
          logId: "log-1",
          level: "info",
          source: "worker",
          message: "Running task",
        },
      ],
    },
    requestContext: {
      requestId: "request-1",
      route: "/runtime/bootstrap",
      method: "SYSTEM",
      actorId: "user-1",
    },
  });

  assert.equal(platformTrace.traceId, "request-1");
  assert.equal(platformTrace.status, "running");
  assert.equal(platformTrace.steps.length, 1);
  assert.equal(platformLogs.length, 1);
  assert.equal(platformLogs[0].message, "Running task");
});

test("platform logging and tracing layer falls back to empty canonical payloads", () => {
  const { platformTrace, platformLogs } = createPlatformLoggingAndTracingLayer();

  assert.equal(typeof platformTrace.traceId, "string");
  assert.equal(platformLogs.length, 0);
});

test("platform logging and tracing layer records trace and logs into observability transport", () => {
  const observabilityTransport = createPlatformObservabilityTransport();

  createPlatformLoggingAndTracingLayer({
    runtimeEvents: {
      runId: "run-transport-1",
      status: "completed",
      progressEntries: [
        {
          id: "progress-transport-1",
          source: "worker",
          status: "completed",
          message: "Bootstrap finished",
        },
      ],
      formattedLogs: [
        {
          logId: "log-transport-1",
          level: "info",
          source: "worker",
          message: "Execution finished",
        },
      ],
    },
    requestContext: {
      requestId: "request-transport-1",
      route: "/runtime/bootstrap",
      method: "SYSTEM",
      actorId: "user-1",
    },
    observabilityTransport,
  });

  const snapshot = observabilityTransport.getSnapshot();

  assert.equal(snapshot.summary.totalTraces, 1);
  assert.equal(snapshot.summary.totalLogs, 1);
  assert.equal(snapshot.platformTraces[0].traceId, "request-transport-1");
  assert.equal(snapshot.platformLogs[0].message, "Execution finished");
});

test("platform logging and tracing layer normalizes malformed trace and log strings", () => {
  const { platformTrace, platformLogs } = createPlatformLoggingAndTracingLayer({
    runtimeEvents: {
      runId: " run-1 ",
      status: " running ",
      progressEntries: [
        {
          id: " progress-1 ",
          source: " worker ",
          status: " running ",
          message: " Bootstrap started ",
        },
      ],
      formattedLogs: [
        {
          logId: " log-1 ",
          level: " info ",
          source: " worker ",
          message: " Running task ",
          command: " npm test ",
        },
      ],
    },
    requestContext: {
      requestId: "  ",
      route: " /runtime/bootstrap ",
      method: " SYSTEM ",
      actorId: " user-1 ",
      workspaceId: " workspace-1 ",
      service: " runtime-service ",
    },
  });

  assert.equal(platformTrace.traceId, "run-1");
  assert.equal(platformTrace.route, "/runtime/bootstrap");
  assert.equal(platformTrace.method, "SYSTEM");
  assert.equal(platformTrace.actorId, "user-1");
  assert.equal(platformTrace.workspaceId, "workspace-1");
  assert.equal(platformTrace.service, "runtime-service");
  assert.equal(platformTrace.status, "running");
  assert.equal(platformTrace.steps[0].stepId, "progress-1");
  assert.equal(platformLogs[0].logId, "log-1");
  assert.equal(platformLogs[0].message, "Running task");
  assert.equal(platformLogs[0].metadata.command, "npm test");
});
