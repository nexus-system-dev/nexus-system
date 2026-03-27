import test from "node:test";
import assert from "node:assert/strict";

import { createLiveLogStreamingModule } from "../src/core/live-log-streaming-module.js";

test("live log streaming module injects stdout, stderr and command outputs in realtime", () => {
  const { liveLogStream } = createLiveLogStreamingModule({
    liveUpdateChannel: {
      channelId: "live-channel:realtime-stream:run-1",
      streamId: "realtime-stream:run-1",
      transportMode: "websocket",
    },
    formattedLogs: [
      { id: "log-1", type: "command", level: "info", message: "npm install", source: "runtime" },
      { id: "log-2", type: "output", level: "info", message: "installed 1 package", source: "runtime" },
      { id: "log-3", type: "output", level: "error", message: "build failed", source: "runtime" },
    ],
  });

  assert.equal(liveLogStream.streamId, "live-log-stream:realtime-stream:run-1");
  assert.equal(liveLogStream.transportMode, "websocket");
  assert.equal(liveLogStream.status, "streaming");
  assert.equal(liveLogStream.streams.stdout.length, 2);
  assert.equal(liveLogStream.streams.stderr.length, 1);
  assert.equal(liveLogStream.commandOutputs.length, 1);
});

test("live log streaming module falls back safely with no logs", () => {
  const { liveLogStream } = createLiveLogStreamingModule();

  assert.equal(typeof liveLogStream.streamId, "string");
  assert.equal(liveLogStream.status, "idle");
  assert.equal(Array.isArray(liveLogStream.streams.stdout), true);
  assert.equal(Array.isArray(liveLogStream.streams.stderr), true);
  assert.equal(liveLogStream.summary.totalEntries, 0);
});
