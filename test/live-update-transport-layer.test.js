import test from "node:test";
import assert from "node:assert/strict";

import { createLiveUpdateTransportLayer } from "../src/core/live-update-transport-layer.js";

test("live update transport layer prefers sse for mixed runtime and workspace signals", () => {
  const { liveUpdateChannel } = createLiveUpdateTransportLayer({
    projectId: "giftwallet",
    realtimeEventStream: {
      streamId: "realtime-stream:run-1",
      summary: {
        totalEvents: 6,
        progressEvents: 2,
        logEvents: 1,
        fileChanges: 1,
        approvalEvents: 1,
        notificationEvents: 1,
      },
    },
  });

  assert.equal(liveUpdateChannel.channelId, "live-channel:realtime-stream:run-1");
  assert.equal(liveUpdateChannel.transportMode, "sse");
  assert.equal(liveUpdateChannel.serverTransport, "sse");
  assert.equal(liveUpdateChannel.deliveryState, "live");
  assert.equal(liveUpdateChannel.deliveryEndpoint, "/api/projects/giftwallet/live-events");
  assert.equal(liveUpdateChannel.refreshStrategy, "push");
  assert.equal(liveUpdateChannel.requiresManualRefresh, false);
  assert.equal(liveUpdateChannel.subscriptions.totalTopics, 5);
});

test("live update transport layer falls back to polling when the stream is empty", () => {
  const { liveUpdateChannel } = createLiveUpdateTransportLayer();

  assert.equal(typeof liveUpdateChannel.channelId, "string");
  assert.equal(liveUpdateChannel.transportMode, "polling");
  assert.equal(liveUpdateChannel.serverTransport, "polling");
  assert.equal(liveUpdateChannel.deliveryState, "idle");
  assert.equal(liveUpdateChannel.deliveryEndpoint, null);
  assert.equal(liveUpdateChannel.refreshStrategy, "scheduled-refresh");
  assert.equal(liveUpdateChannel.buffering.enabled, false);
  assert.equal(liveUpdateChannel.summary.totalEvents, 0);
  assert.equal(Array.isArray(liveUpdateChannel.subscriptions.topics), true);
});
