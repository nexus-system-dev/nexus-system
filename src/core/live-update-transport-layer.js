function normalizeRealtimeEventStream(realtimeEventStream) {
  return realtimeEventStream && typeof realtimeEventStream === "object"
    ? realtimeEventStream
    : {};
}

function normalizeSummary(summary) {
  return summary && typeof summary === "object" ? summary : {};
}

function resolveTransportMode(summary) {
  const totalEvents = summary.totalEvents ?? 0;

  if (totalEvents === 0) {
    return "polling";
  }

  if ((summary.logEvents ?? 0) > 0 || totalEvents >= 3) {
    return "sse";
  }

  return "polling";
}

function buildReconnectPolicy(transportMode) {
  if (transportMode === "sse") {
    return {
      strategy: "linear-retry",
      retryable: true,
      initialDelayMs: 1500,
      maxDelayMs: 5000,
    };
  }

  return {
    strategy: "interval-refresh",
    retryable: true,
    initialDelayMs: 5000,
    maxDelayMs: 15000,
  };
}

function buildSubscriptionTopics(summary) {
  return [
    (summary.progressEvents ?? 0) > 0 ? "progress" : null,
    (summary.logEvents ?? 0) > 0 ? "logs" : null,
    (summary.fileChanges ?? 0) > 0 ? "file-changes" : null,
    (summary.approvalEvents ?? 0) > 0 ? "approvals" : null,
    (summary.notificationEvents ?? 0) > 0 ? "notifications" : null,
  ].filter(Boolean);
}

export function createLiveUpdateTransportLayer({
  realtimeEventStream = null,
  projectId = null,
} = {}) {
  const normalizedRealtimeEventStream = normalizeRealtimeEventStream(realtimeEventStream);
  const summary = normalizeSummary(normalizedRealtimeEventStream.summary);
  const transportMode = resolveTransportMode(summary);
  const topics = buildSubscriptionTopics(summary);
  const totalEvents = summary.totalEvents ?? 0;
  const normalizedProjectId = typeof projectId === "string" && projectId.length > 0 ? projectId : null;
  const serverTransport = transportMode;
  const deliveryEndpoint = normalizedProjectId
    ? transportMode === "polling"
      ? `/api/projects/${normalizedProjectId}/live-state`
      : `/api/projects/${normalizedProjectId}/live-events`
    : null;

  return {
    liveUpdateChannel: {
      channelId: `live-channel:${normalizedRealtimeEventStream.streamId ?? "project"}`,
      streamId: normalizedRealtimeEventStream.streamId ?? null,
      transportMode,
      serverTransport,
      deliveryState: totalEvents > 0 ? "live" : "idle",
      refreshStrategy: transportMode === "polling" ? "scheduled-refresh" : "push",
      deliveryEndpoint,
      requiresManualRefresh: false,
      reconnectPolicy: buildReconnectPolicy(transportMode),
      buffering: {
        enabled: transportMode !== "polling",
        maxBufferedEvents: transportMode === "sse" ? 25 : 0,
      },
      subscriptions: {
        topics,
        totalTopics: topics.length,
      },
      summary: {
        totalEvents,
        transportMode,
        serverTransport,
        isLive: transportMode !== "polling" || totalEvents > 0,
        hasRuntimeSignal: ((summary.progressEvents ?? 0) + (summary.logEvents ?? 0)) > 0,
        hasWorkspaceSignal: ((summary.fileChanges ?? 0) + (summary.approvalEvents ?? 0) + (summary.notificationEvents ?? 0)) > 0,
      },
    },
  };
}
