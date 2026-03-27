import test from "node:test";
import assert from "node:assert/strict";

import { defineRealtimeEventStreamSchema } from "../src/core/realtime-event-stream-schema.js";

test("realtime event stream schema combines runtime and workspace event streams", () => {
  const { realtimeEventStream } = defineRealtimeEventStreamSchema({
    runtimeEvents: {
      runId: "run-1",
      status: "active",
      progressEntries: [{ id: "progress-1", message: "Bootstrap started" }],
      formattedLogs: [{ id: "log-1", message: "Running npm install", level: "info", source: "runtime" }],
      executionEvents: [{ id: "exec-1", message: "Command finished", status: "completed" }],
    },
    workspaceEvents: {
      projectId: "giftwallet",
      fileChanges: [{ id: "file-1", path: "src/app.js", status: "changed" }],
      approvals: [{ id: "approval-1", reason: "Production approval pending", status: "pending" }],
      notifications: [{ id: "notification-1", message: "Build completed", status: "done" }],
    },
  });

  assert.equal(realtimeEventStream.streamId, "realtime-stream:run-1");
  assert.equal(realtimeEventStream.summary.totalEvents, 6);
  assert.equal(realtimeEventStream.summary.fileChanges, 1);
  assert.equal(realtimeEventStream.summary.notificationEvents, 1);
});

test("realtime event stream schema falls back safely with empty inputs", () => {
  const { realtimeEventStream } = defineRealtimeEventStreamSchema();

  assert.equal(typeof realtimeEventStream.streamId, "string");
  assert.equal(Array.isArray(realtimeEventStream.events), true);
  assert.equal(realtimeEventStream.summary.totalEvents, 0);
});
