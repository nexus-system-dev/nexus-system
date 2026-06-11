import test from "node:test";
import assert from "node:assert/strict";

import { createPlatformObservabilityTransport } from "../src/core/platform-observability-transport.js";

test("platform observability transport redacts sensitive diagnostic metadata", () => {
  const observabilityTransport = createPlatformObservabilityTransport();

  observabilityTransport.recordTraceEnvelope({
    platformTrace: {
      traceId: "obs-001-trace",
      route: "/api/projects/demo/live-events",
      method: "GET",
      status: "failed",
    },
    platformLogs: [
      {
        level: "warn",
        source: "http-server",
        message: "Live event stream failed authorization",
        metadata: {
          authorization: "Bearer live-secret",
          cookie: "nexus_access_token=secret",
          nested: {
            apiKey: "provider-key",
            safeValue: "kept",
          },
        },
      },
    ],
  });

  const snapshot = observabilityTransport.getSnapshot();
  const metadata = snapshot.platformLogs[0].metadata;

  assert.equal(metadata.authorization, "[redacted]");
  assert.equal(metadata.cookie, "[redacted]");
  assert.equal(metadata.nested.apiKey, "[redacted]");
  assert.equal(metadata.nested.safeValue, "kept");
});

test("platform observability transport preserves trace ids and bounded runtime failure evidence", () => {
  const observabilityTransport = createPlatformObservabilityTransport();

  observabilityTransport.startHttpRequest({
    requestId: "obs-001-request",
    route: "/api/projects/demo/live-events",
    method: "GET",
    workspaceId: "demo",
    service: "nexus-runtime",
  });
  observabilityTransport.finishHttpRequest({
    traceId: "obs-001-request",
    route: "/api/projects/demo/live-events",
    method: "GET",
    statusCode: 401,
    durationMs: 9,
    service: "nexus-runtime",
  });

  const snapshot = observabilityTransport.getSnapshot();

  assert.equal(snapshot.platformTraces[0].traceId, "obs-001-request");
  assert.equal(snapshot.platformTraces[0].status, "completed");
  assert.equal(snapshot.platformLogs.at(-1).level, "warn");
  assert.equal(snapshot.platformLogs.at(-1).metadata.statusCode, 401);
});
