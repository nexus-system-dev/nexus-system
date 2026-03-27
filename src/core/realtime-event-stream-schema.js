function normalizeObject(value) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : [];
}

function buildProgressEvents(runtimeEvents) {
  const normalizedRuntimeEvents = normalizeObject(runtimeEvents);
  const entries = normalizeArray(normalizedRuntimeEvents.progressEntries);

  return entries.map((entry, index) => {
    const normalizedEntry = normalizeObject(entry);

    return {
      eventId: normalizedEntry.id ?? `progress-event-${index + 1}`,
      streamType: "progress",
      status: normalizedEntry.status ?? normalizedRuntimeEvents.status ?? "active",
      message: normalizedEntry.message ?? normalizedEntry.label ?? `Progress event ${index + 1}`,
      timestamp: normalizedEntry.timestamp ?? null,
    };
  });
}

function buildLogEvents(runtimeEvents) {
  const normalizedRuntimeEvents = normalizeObject(runtimeEvents);
  const entries = normalizeArray(normalizedRuntimeEvents.formattedLogs);

  return entries.map((entry, index) => {
    const normalizedEntry = normalizeObject(entry);

    return {
      eventId: normalizedEntry.id ?? `log-event-${index + 1}`,
      streamType: "log",
      status: normalizedEntry.level === "error" ? "failed" : "active",
      message: normalizedEntry.message ?? `Log event ${index + 1}`,
      timestamp: normalizedEntry.timestamp ?? null,
      source: normalizedEntry.source ?? "runtime",
    };
  });
}

function buildExecutionEvents(runtimeEvents) {
  const normalizedRuntimeEvents = normalizeObject(runtimeEvents);
  const entries = normalizeArray(normalizedRuntimeEvents.executionEvents);

  return entries.map((entry, index) => {
    const normalizedEntry = normalizeObject(entry);

    return {
      eventId: normalizedEntry.id ?? `execution-event-${index + 1}`,
      streamType: "execution",
      status: normalizedEntry.status ?? "pending",
      message: normalizedEntry.message ?? `Execution event ${index + 1}`,
      timestamp: normalizedEntry.timestamp ?? null,
      source: normalizedEntry.source ?? "execution-surface",
    };
  });
}

function buildWorkspaceEvents(workspaceEvents) {
  const normalizedWorkspaceEvents = normalizeObject(workspaceEvents);

  return [
    ...normalizeArray(normalizedWorkspaceEvents.fileChanges).map((entry, index) => {
      const normalizedEntry = normalizeObject(entry);

      return {
        eventId: normalizedEntry.id ?? `file-change-${index + 1}`,
        streamType: "file-change",
        status: normalizedEntry.status ?? "changed",
        message: normalizedEntry.message ?? normalizedEntry.path ?? `File change ${index + 1}`,
        timestamp: normalizedEntry.timestamp ?? null,
      };
    }),
    ...normalizeArray(normalizedWorkspaceEvents.approvals).map((entry, index) => {
      const normalizedEntry = normalizeObject(entry);

      return {
        eventId: normalizedEntry.id ?? `approval-event-${index + 1}`,
        streamType: "approval",
        status: normalizedEntry.status ?? "pending",
        message: normalizedEntry.message ?? normalizedEntry.reason ?? `Approval event ${index + 1}`,
        timestamp: normalizedEntry.timestamp ?? null,
      };
    }),
    ...normalizeArray(normalizedWorkspaceEvents.notifications).map((entry, index) => {
      const normalizedEntry = normalizeObject(entry);

      return {
        eventId: normalizedEntry.id ?? `notification-event-${index + 1}`,
        streamType: "notification",
        status: normalizedEntry.status ?? "pending",
        message: normalizedEntry.message ?? normalizedEntry.title ?? `Notification event ${index + 1}`,
        timestamp: normalizedEntry.timestamp ?? null,
      };
    }),
  ];
}

export function defineRealtimeEventStreamSchema({
  runtimeEvents = null,
  workspaceEvents = null,
} = {}) {
  const normalizedRuntimeEvents = normalizeObject(runtimeEvents);
  const normalizedWorkspaceEvents = normalizeObject(workspaceEvents);
  const events = [
    ...buildProgressEvents(normalizedRuntimeEvents),
    ...buildLogEvents(normalizedRuntimeEvents),
    ...buildExecutionEvents(normalizedRuntimeEvents),
    ...buildWorkspaceEvents(normalizedWorkspaceEvents),
  ];

  return {
    realtimeEventStream: {
      streamId: `realtime-stream:${normalizedRuntimeEvents.runId ?? normalizedWorkspaceEvents.projectId ?? "project"}`,
      events,
      summary: {
        totalEvents: events.length,
        progressEvents: events.filter((event) => event.streamType === "progress").length,
        logEvents: events.filter((event) => event.streamType === "log").length,
        fileChanges: events.filter((event) => event.streamType === "file-change").length,
        approvalEvents: events.filter((event) => event.streamType === "approval").length,
        notificationEvents: events.filter((event) => event.streamType === "notification").length,
      },
    },
  };
}
