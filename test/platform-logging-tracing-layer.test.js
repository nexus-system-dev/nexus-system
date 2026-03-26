import test from "node:test";
import assert from "node:assert/strict";

import { createPlatformLoggingAndTracingLayer } from "../src/core/platform-logging-tracing-layer.js";

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
