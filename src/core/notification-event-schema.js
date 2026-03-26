function normalizeEventType(eventType, eventPayload) {
  if (typeof eventType === "string" && eventType.trim()) {
    return eventType.trim();
  }

  if (typeof eventPayload?.type === "string" && eventPayload.type.trim()) {
    return eventPayload.type.trim();
  }

  return "generic-notification";
}

function normalizeEventPayload(eventPayload) {
  return eventPayload && typeof eventPayload === "object" ? eventPayload : {};
}

export function defineNotificationEventSchema({
  eventType,
  eventPayload = null,
} = {}) {
  const normalizedPayload = normalizeEventPayload(eventPayload);
  const normalizedEventType = normalizeEventType(eventType, normalizedPayload);
  const status = typeof normalizedPayload.status === "string" ? normalizedPayload.status : "pending";

  return {
    notificationEvent: {
      notificationEventId: `notification-${normalizedEventType}-${Date.now()}`,
      eventType: normalizedEventType,
      status,
      title:
        typeof normalizedPayload.title === "string" && normalizedPayload.title
          ? normalizedPayload.title
          : normalizedEventType,
      message:
        typeof normalizedPayload.message === "string" && normalizedPayload.message
          ? normalizedPayload.message
          : "Notification event created",
      channels: Array.isArray(normalizedPayload.channels) && normalizedPayload.channels.length > 0
        ? normalizedPayload.channels
        : ["in-app"],
      actorId: normalizedPayload.actorId ?? null,
      userId: normalizedPayload.userId ?? null,
      projectId: normalizedPayload.projectId ?? null,
      taskId: normalizedPayload.taskId ?? null,
      requiresApproval: normalizedPayload.requiresApproval === true,
      nextAction: normalizedPayload.nextAction ?? null,
      createdAt: typeof normalizedPayload.createdAt === "string" ? normalizedPayload.createdAt : new Date().toISOString(),
      metadata: normalizedPayload.metadata ?? {},
    },
  };
}
